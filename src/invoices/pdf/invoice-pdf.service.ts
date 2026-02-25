// src/invoices/pdf/invoice-pdf.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { formatDate, formatCurrency, amountInWords } from './utils';

@Injectable()
export class InvoicePdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(invoiceId: number): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const html = this.renderTemplate(invoice);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /* ─────────────────────────────────────────
     TEMPLATE RENDER
  ───────────────────────────────────────── */
  private renderTemplate(invoice: any): string {
    const templatePath = path.join(
      process.cwd(),
      'src/invoices/pdf/invoice.template.html',
    );
    let html = fs.readFileSync(templatePath, 'utf8');

    const BASE_URL = process.env.APP_URL;
    const companyId = invoice.fromCompanyId;

    // ── Asset URLs ────────────────────────────────────────────────
    const logoUrl = invoice.fromCompanyLogoUrl
      ? `${BASE_URL}${invoice.fromCompanyLogoUrl}`
      : '';
    const signatureUrl = invoice.companySignatureUrl
      ? `${BASE_URL}${invoice.companySignatureUrl}`
      : '';
    const sealUrl = invoice.companySealUrl
      ? `${BASE_URL}${invoice.companySealUrl}`
      : '';

    // ── Derived numerics ──────────────────────────────────────────
    const taxableValue = Number(invoice.subtotal);
    const cgst = Number(invoice.cgstAmount || 0);
    const sgst = Number(invoice.sgstAmount || 0);
    const igst = Number(invoice.igstAmount || 0);
    const totalTax = cgst + sgst + igst;
    const grandTotal = Number(invoice.total);
    const hasDiscount = Number(invoice.discount || 0) !== 0;

    // ── Company short name / initials fallback ────────────────────
    const companyShortName: string =
      invoice.fromCompanyShortName ||
      (invoice.fromCompanyName as string)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('');

    // ── Service period (auto from task dates or explicit) ─────────
    const servicePeriod: string =
      invoice.servicePeriod ||
      (invoice.serviceFrom && invoice.serviceTo
        ? `${formatDate(invoice.serviceFrom)} to ${formatDate(invoice.serviceTo)}`
        : '');

    // ── Due date ──────────────────────────────────────────────────
    const dueDate: string = invoice.dueDate ? formatDate(invoice.dueDate) : '';

    // ── Client GSTIN — show "Unregistered" if absent ──────────────
    const clientGSTIN: string = invoice.clientGSTIN?.trim() || 'Unregistered';

    // ── Client state code — first 2 digits of GSTIN or explicit ──
    const clientStateCode: string =
      invoice.clientStateCode ||
      (clientGSTIN !== 'Unregistered' ? clientGSTIN.slice(0, 2) : '—');

    // ── Jurisdiction city ─────────────────────────────────────────
    const jurisdictionCity: string =
      invoice.fromCompanyCity ||
      (invoice.fromCompanyAddress as string)
        ?.split(',')
        .slice(-2, -1)[0]
        ?.trim() ||
      'Ahmedabad';

    /* ─────────────────────────────────────────
       BASIC REPLACEMENTS
    ───────────────────────────────────────── */
    const replacements: Record<string, string> = {
      // Header
      '{{logoUrl}}': logoUrl,
      '{{companyShortName}}': companyShortName,
      '{{companyName}}': invoice.fromCompanyName,
      '{{companyTagline}}': invoice.fromCompanyTagline || '',

      // Firm details (meta-left)
      '{{companyAddress}}': invoice.fromCompanyAddress,
      '{{companyGSTIN}}': invoice.fromCompanyGstin || '',
      '{{companyPAN}}': invoice.fromCompanyPan || '',
      '{{companyMSME}}': invoice.fromCompanyMsme || 'N/A',
      '{{companyMSMECategory}}': invoice.fromCompanyMsmeCategory || 'N/A',
      '{{companyEmail}}': invoice.fromCompanyEmail || '',
      '{{companyPhone}}': invoice.fromCompanyPhone || '',

      // Invoice meta (meta-right)
      '{{invoiceNumber}}': invoice.invoiceNumber,
      '{{invoiceDate}}': formatDate(invoice.createdAt),
      '{{dueDate}}': dueDate,
      '{{placeOfSupply}}': invoice.fromCompanyState || '',
      '{{servicePeriod}}': servicePeriod,

      // Client
      '{{clientName}}': invoice.clientName,
      '{{clientAddress}}': invoice.clientAddress || '',
      '{{clientGSTIN}}': clientGSTIN,
      '{{clientStateCode}}': clientStateCode,

      // Words
      '{{amountChargeableWords}}': amountInWords(grandTotal),

      // Bank
      '{{bankName}}': invoice.bankName || '',
      '{{bankAccount}}': invoice.bankAccount || '',
      '{{bankIfsc}}': invoice.bankIfsc || '',
      '{{bankUpi}}': invoice.bankUpi || '',

      // Assets & footer
      '{{signatureUrl}}': signatureUrl,
      '{{sealUrl}}': sealUrl,
      '{{jurisdictionCity}}': jurisdictionCity,
      '{{discountHeader}}': hasDiscount
        ? '<th class="c" style="width:100px">Discount</th>'
        : '',
    };

    for (const key in replacements) {
      html = html.replace(
        new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'),
        replacements[key],
      );
    }

    /* ─────────────────────────────────────────
       ITEMS TABLE ROWS
       Sr No | Description | Task ID | SAC | Period | Discount | Net Amount
    ───────────────────────────────────────── */
    const itemsHtml = (invoice.items as any[])
      .map((item, idx) => {
        const discountCellHtml = hasDiscount
          ? `<td class="disc-cell">₹ ${formatCurrency(invoice.discount)}</td>`
          : '';

        return `
          <tr>
            <td class="c">${idx + 1}</td>
            <td>${item.title || item.description || ''}</td>
            <td class="c" style="font-size:11.5px;color:#666">${item.taskId || ''}</td>
            <td class="c">${item.hsnSac || ''}</td>
            <td class="c">${item.period || ''}</td>
            ${discountCellHtml}
            <td class="r">₹ ${formatCurrency(item.amount)}</td>
          </tr>
        `;
      })
      .join('');

    /* ─────────────────────────────────────────
       TOTALS BLOCK
       Taxable Value
       CGST @ x% / SGST @ x%   OR   IGST @ x%
       ─────────────────────────── (border-top)
       Total                    ₹ xx,xxx  (large)
    ───────────────────────────────────────── */
    let taxRows = '';

    if (invoice.isIntraState) {
      const halfRate = Number(invoice.gstPercent) / 2;
      taxRows = `
        <div class="trow">
          <span class="tl">CGST @ ${halfRate}%</span>
          <span class="tv">₹ ${formatCurrency(cgst)}</span>
        </div>
        <div class="trow">
          <span class="tl">SGST @ ${halfRate}%</span>
          <span class="tv">₹ ${formatCurrency(sgst)}</span>
        </div>
      `;
    } else {
      taxRows = `
        <div class="trow">
          <span class="tl">IGST @ ${invoice.gstPercent}%</span>
          <span class="tv">₹ ${formatCurrency(igst)}</span>
        </div>
      `;
    }

    const taxSummaryTable = `
      <div class="trow">
        <span class="tl">Taxable Value</span>
        <span class="tv">₹ ${formatCurrency(taxableValue)}</span>
      </div>
      ${taxRows}
      <div class="trow grand">
        <span class="tl">Total</span>
        <span class="tv">₹ ${formatCurrency(grandTotal)}</span>
      </div>
    `;

    html = html
      .replace('{{items}}', itemsHtml)
      .replace('{{taxSummaryTable}}', taxSummaryTable);

    return html;
  }
}
