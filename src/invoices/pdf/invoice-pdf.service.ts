// src/invoices/pdf/invoice-pdf.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'
import {
  formatDate,
  formatCurrency,
  amountInWords,
} from './utils'

@Injectable()
export class InvoicePdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(invoiceId: number): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    })

    if (!invoice) {
      throw new NotFoundException('Invoice not found')
    }

    const html = this.renderTemplate(invoice)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

  /* ===========================
     TEMPLATE RENDER
  =========================== */
  private renderTemplate(invoice: any): string {
    const templatePath = path.join(
      process.cwd(),
      'src/invoices/pdf/invoice.template.html',
    )

    let html = fs.readFileSync(templatePath, 'utf8')

    const BASE_URL = process.env.APP_URL
    const companyId = invoice.fromCompanyId

    const sealUrl = `${BASE_URL}/uploads/companies/${companyId}/seal.png`
    const signatureUrl = `${BASE_URL}/uploads/companies/${companyId}/signature.png`

    const taxableValue = Number(invoice.subtotal)
    const totalTax =
      Number(invoice.cgstAmount || 0) +
      Number(invoice.sgstAmount || 0) +
      Number(invoice.igstAmount || 0)

    /* ===========================
       NOTES BLOCK (SAFE)
    =========================== */
    const notesText =
    typeof invoice.notes === 'string'
      ? invoice.notes.trim()
      : ''
  
      const notesBlock = notesText
        ? `
          <div style="margin-top:10px;">
            <h4>Notes</h4>
            <p>${notesText.replace(/\n/g, '<br />')}</p>
          </div>
          
        `
        : ` `
      
  

    /* ===========================
       BASIC REPLACEMENTS
    =========================== */
    const replacements: Record<string, string> = {
      '{{invoiceNumber}}': invoice.invoiceNumber,
      '{{invoiceDate}}': formatDate(invoice.createdAt),

      '{{companyName}}': invoice.fromCompanyName,
      '{{companyAddress}}': invoice.fromCompanyAddress,

      '{{clientName}}': invoice.clientName,
      '{{clientAddress}}': invoice.clientAddress || '',

      '{{grandTotal}}': formatCurrency(invoice.total),

      '{{amountChargeableWords}}': amountInWords(Number(invoice.total)),
      '{{taxAmountWords}}': amountInWords(totalTax),

      '{{bankName}}': invoice.bankName || '',
      '{{bankAccount}}': invoice.bankAccount || '',
      '{{bankIfsc}}': invoice.bankIfsc || '',

      '{{sealUrl}}': sealUrl,
      '{{signatureUrl}}': signatureUrl,

      '{{notesBlock}}': notesBlock,

      '{{jurisdictionCity}}':
      invoice.fromCompanyCity ||
      invoice.fromCompanyAddress?.split(',').slice(-2, -1)[0]?.trim() ||
      '',
    
      
    }

    for (const key in replacements) {
      html = html.replace(new RegExp(key, 'g'), replacements[key])
    }

    /* ===========================
       ITEMS TABLE
    =========================== */
    const itemsHtml = invoice.items
      .map(
        (i, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>${i.title}</td>
          <td class="center">${i.hsnSac || ''}</td>
          <td class="center">${i.quantity}</td>
          <td class="right">${formatCurrency(i.unitPrice)}</td>
          <td class="right">${formatCurrency(i.amount)}</td>
        </tr>
      `,
      )
      .join('')

    /* ===========================
       TAX SUMMARY TABLE (DYNAMIC)
    =========================== */
    let taxSummaryTable = ''

    if (invoice.isIntraState) {
      const halfRate = Number(invoice.gstPercent) / 2

      taxSummaryTable = `
      <h4>Tax Summary</h4>
      <table>
        <thead>
          <tr>
            <th>Taxable Value</th>
            <th>CGST %</th>
            <th>CGST Amt</th>
            <th>SGST %</th>
            <th>SGST Amt</th>
            <th>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="right">${formatCurrency(taxableValue)}</td>
            <td class="center">${halfRate}%</td>
            <td class="right">${formatCurrency(invoice.cgstAmount)}</td>
            <td class="center">${halfRate}%</td>
            <td class="right">${formatCurrency(invoice.sgstAmount)}</td>
            <td class="right">${formatCurrency(totalTax)}</td>
          </tr>
        </tbody>
      </table>
      `
    } else {
      taxSummaryTable = `
      <h4>Tax Summary</h4>
      <table>
        <thead>
          <tr>
            <th>Taxable Value</th>
            <th>IGST %</th>
            <th>IGST Amt</th>
            <th>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="right">${formatCurrency(taxableValue)}</td>
            <td class="center">${invoice.gstPercent}%</td>
            <td class="right">${formatCurrency(invoice.igstAmount)}</td>
            <td class="right">${formatCurrency(totalTax)}</td>
          </tr>
        </tbody>
      </table>
      `
    }

    html = html
      .replace('{{items}}', itemsHtml)
      .replace('{{taxSummaryTable}}', taxSummaryTable)

    return html
  }
}
