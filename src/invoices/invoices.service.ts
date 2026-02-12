import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { InvoiceStatus } from '@prisma/client'
import { CreateInvoiceFromTasksDto } from './dto/create-invoice-from-tasks.dto'

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /* ===========================
     GST CALCULATION
  =========================== */

  private computeTotals(args: {
    items: { quantity: number; unitPrice: number }[]
    gstPercent: number
    pricingMode: 'EXCLUSIVE' | 'INCLUSIVE'
    isIntraState: boolean
    discount?: number
  }) {
    const gstRate = args.gstPercent / 100
    const discount = args.discount || 0

    const raw = args.items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0,
    )

    let subtotal = 0
    let gst = 0

    if (args.pricingMode === 'EXCLUSIVE') {
      subtotal = raw
      gst = raw * gstRate
    } else {
      subtotal = raw / (1 + gstRate)
      gst = raw - subtotal
    }

    let cgst = 0
    let sgst = 0
    let igst = 0

    if (args.isIntraState) {
      cgst = gst / 2
      sgst = gst / 2
    } else {
      igst = gst
    }

    const total =
      args.pricingMode === 'EXCLUSIVE'
        ? subtotal + gst - discount
        : raw - discount

    const r2 = (n: number) => Math.round(n * 100) / 100

    return {
      subtotal: r2(subtotal),
      cgstAmount: r2(cgst),
      sgstAmount: r2(sgst),
      igstAmount: r2(igst),
      total: r2(total),
    }
  }

  /* ===========================
     INVOICE NUMBERING
  =========================== */

  private getFinancialYear(date = new Date()) {
    const y = date.getFullYear()
    return date.getMonth() < 3
      ? `${String(y - 1).slice(2)}${String(y).slice(2)}`
      : `${String(y).slice(2)}${String(y + 1).slice(2)}`
  }
  
  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    companyId: number,
    companyCode: string,
    date = new Date(),
  ) {
    const fy = this.getFinancialYear(date)
  
    const month = date
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase()
  
    const seq = await tx.invoiceSequence.upsert({
      where: {
        companyId_fy_month: {
          companyId,
          fy,
          month,
        },
      },
      update: { counter: { increment: 1 } },
      create: {
        companyId,
        fy,
        month,
        counter: 1,
      },
    })
  
    return `O/${companyCode}/${month}${String(seq.counter).padStart(2, '0')}/${fy}`
  }
  
  /* ===========================
     CREATE INVOICE
  =========================== */

  // async create(userId: number, dto: CreateInvoiceDto) {
  //   return this.prisma.$transaction(async (tx) => {
  //     const company = await tx.myCompany.findUnique({
  //       where: { id: dto.fromCompanyId },
  //     })
  //     if (!company) throw new BadRequestException('Invalid company')

  //     const client = await tx.client.findUnique({
  //       where: { id: dto.clientId },
  //     })
  //     if (!client) throw new BadRequestException('Invalid client')

  //     const isIntraState = company.state === client.state

  //     const invoiceNumber = await this.generateInvoiceNumber(
  //       tx,
  //       company.id,
  //       company.code,
  //     )

  //     const items = dto.items.map((i) => ({
  //       title: i.title,
  //       description: i.description || null,
  //       taskId: i.taskId || null,
  //       quantity: i.quantity ?? 1,
  //       unitPrice: new Prisma.Decimal(i.unitPrice),
  //       amount: new Prisma.Decimal((i.quantity ?? 1) * i.unitPrice),
  //     }))

  //     const computed = this.computeTotals({
  //       items: items.map((i) => ({
  //         quantity: i.quantity,
  //         unitPrice: Number(i.unitPrice),
  //       })),
  //       gstPercent: dto.gstPercent ?? 18,
  //       pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
  //       isIntraState,
  //       discount: dto.discount ?? 0,
  //     })

  //     return tx.invoice.create({
  //       data: {
  //         invoiceNumber,
  //         status: 'DRAFT',

  //         clientId: client.id,
  //         fromCompanyId: company.id,
  //         createdById: userId,

  //         /* ---------- SNAPSHOT: COMPANY ---------- */
  //         fromCompanyName: company.name,
  //         fromCompanyAddress: [
  //           company.addressLine1,
  //           company.addressLine2,
  //           company.city,
  //           company.state,
  //           company.pincode,
  //         ].filter(Boolean).join(', '),
  //         fromCompanyGstin: company.gstin,
  //         fromCompanyCity: company.city,
  //         fromCompanyState: company.state,
  //         fromCompanyPhone: company.phone,
  //         fromCompanyEmail: company.email,

  //         bankName: company.bankName,
  //         bankAccount: company.bankAccount,
  //         bankIfsc: company.bankIfsc,
  //         bankBranch: company.bankBranch,

  //         companySealUrl: company.sealUrl,
  //         companySignatureUrl: company.signatureUrl,

  //         /* ---------- SNAPSHOT: CLIENT ---------- */
  //         clientName: client.name,
  //         clientGstin: client.gstNumber,
  //         clientAddress: [
  //           client.addressLine1,
  //           client.addressLine2,
  //           client.city,
  //           client.state,
  //           client.pincode,
  //         ].filter(Boolean).join(', '),
          
  //         clientCity: client.city,
  //         clientPincode: client.pincode,
  //         clientState: client.state,
  //         clientStateCode: client.stateCode || null,
          
  //         clientPhone: client.phone,
  //         clientEmail: client.email,

  //         /* ---------- GST ---------- */
  //         gstPercent: new Prisma.Decimal(dto.gstPercent ?? 18),
  //         pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
  //         isIntraState,
  //         placeOfSupply: dto.placeOfSupply || null,

  //         /* ---------- TOTALS ---------- */
  //         discount: new Prisma.Decimal(dto.discount ?? 0),

  //         subtotal: new Prisma.Decimal(
  //           dto.isManualTotal ? dto.subtotal! : computed.subtotal,
  //         ),
  //         cgstAmount: new Prisma.Decimal(
  //           dto.isManualTotal ? dto.cgstAmount! : computed.cgstAmount,
  //         ),
  //         sgstAmount: new Prisma.Decimal(
  //           dto.isManualTotal ? dto.sgstAmount! : computed.sgstAmount,
  //         ),
  //         igstAmount: new Prisma.Decimal(
  //           dto.isManualTotal ? dto.igstAmount! : computed.igstAmount,
  //         ),
  //         total: new Prisma.Decimal(
  //           dto.isManualTotal ? dto.total! : computed.total,
  //         ),
  //         isManualTotal: !!dto.isManualTotal,

  //         notes: dto.notes || null,

  //         items: { create: items },
  //       },
  //     })
  //   })
  // }
  async create(userId: number, dto: CreateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.myCompany.findUnique({
        where: { id: dto.fromCompanyId },
      })
      if (!company) throw new BadRequestException('Invalid company')
  
      const client = await tx.client.findUnique({
        where: { id: dto.clientId },
      })
      if (!client) throw new BadRequestException('Invalid client')
  
      const isIntraState = company.state === client.state
  
      const invoiceNumber = await this.generateInvoiceNumber(
        tx,
        company.id,
        company.code,
      )
  
      /* =======================================================
         TASK VALIDATION BLOCK
      ======================================================= */
  
      let validatedTasks: any[] = []
  
      if (dto.sourceType === 'TASKS') {
        const taskIds = dto.items
          .map(i => i.taskId)
          .filter(Boolean) as number[]
  
        if (!taskIds.length) {
          throw new BadRequestException('No taskIds provided')
        }
  
        const tasks = await tx.task.findMany({
          where: {
            id: { in: taskIds },
            deletedAt: null,
          },
          include: {
            invoiceItems: true,
            taskMaster: true,
          },
        })
  
        if (tasks.length !== taskIds.length) {
          throw new BadRequestException('Invalid tasks selected')
        }
  
        /* 1️⃣ Same Client */
        const uniqueClients = [...new Set(tasks.map(t => t.clientId))]
        if (uniqueClients.length !== 1) {
          throw new BadRequestException(
            'All tasks must belong to same client',
          )
        }
  
        /* 2️⃣ Billable */
        if (tasks.some(t => !t.isBillable)) {
          throw new BadRequestException(
            'Some tasks are not billable',
          )
        }
  
        /* 3️⃣ Completed */
        if (tasks.some(t => t.status !== 'COMPLETED')) {
          throw new BadRequestException(
            'Only completed tasks can be invoiced',
          )
        }
  
        /* 4️⃣ Not Already Invoiced */
        if (tasks.some(t => t.invoiceItems.length > 0)) {
          throw new BadRequestException(
            'Some tasks already invoiced',
          )
        }
  
        validatedTasks = tasks
      }
  
      /* =======================================================
         ITEM CREATION
      ======================================================= */
  
      const items = dto.items.map((i) => {
        let hsnSac: string | null = i.hsnSac || null
  
        if (dto.sourceType === 'TASKS') {
          const task = validatedTasks.find(t => t.id === i.taskId)
          if (!task) {
            throw new BadRequestException('Invalid task mapping')
          }
  
          // Force HSN from TaskMaster if exists
          hsnSac = task.taskMaster?.hsnSac || task.hsnSac || null
        }
  
        return {
          title: i.title,
          description: i.description || null,
          taskId: i.taskId || null,
          quantity: i.quantity ?? 1,
          unitPrice: new Prisma.Decimal(i.unitPrice ?? 0),
          amount: new Prisma.Decimal(
            (i.quantity ?? 1) * (i.unitPrice ?? 0),
          ),
          hsnSac,
        }
      })
  
      /* =======================================================
         TOTAL COMPUTATION
      ======================================================= */
  
      const computed = this.computeTotals({
        items: items.map((i) => ({
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
        gstPercent: dto.gstPercent ?? 18,
        pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
        isIntraState,
        discount: dto.discount ?? 0,
      })
  
      /* =======================================================
         INVOICE CREATION
      ======================================================= */
  
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          status: 'DRAFT',
          sourceType: dto.sourceType || 'MANUAL',
  
          clientId: client.id,
          fromCompanyId: company.id,
          createdById: userId,
  
          /* COMPANY SNAPSHOT */
          fromCompanyName: company.name,
          fromCompanyAddress: [
            company.addressLine1,
            company.addressLine2,
            company.city,
            company.state,
            company.pincode,
          ].filter(Boolean).join(', '),
          fromCompanyGstin: company.gstin,
          fromCompanyCity: company.city,
          fromCompanyState: company.state,
          fromCompanyPhone: company.phone,
          fromCompanyEmail: company.email,
  
          bankName: company.bankName,
          bankAccount: company.bankAccount,
          bankIfsc: company.bankIfsc,
          bankBranch: company.bankBranch,
  
          companySealUrl: company.sealUrl,
          companySignatureUrl: company.signatureUrl,
  
          /* CLIENT SNAPSHOT */
          clientName: client.name,
          clientGstin: client.gstNumber,
          clientAddress: [
            client.addressLine1,
            client.addressLine2,
            client.city,
            client.state,
            client.pincode,
          ].filter(Boolean).join(', '),
  
          clientCity: client.city,
          clientPincode: client.pincode,
          clientState: client.state,
          clientStateCode: client.stateCode || null,
          clientPhone: client.phone,
          clientEmail: client.email,
  
          /* TAX */
          gstPercent: new Prisma.Decimal(dto.gstPercent ?? 18),
          pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
          isIntraState,
          placeOfSupply: dto.placeOfSupply || null,
  
          discount: new Prisma.Decimal(dto.discount ?? 0),
  
          subtotal: new Prisma.Decimal(computed.subtotal),
          cgstAmount: new Prisma.Decimal(computed.cgstAmount),
          sgstAmount: new Prisma.Decimal(computed.sgstAmount),
          igstAmount: new Prisma.Decimal(computed.igstAmount),
          total: new Prisma.Decimal(computed.total),
  
          isManualTotal: false,
  
          notes: dto.notes || null,
  
          items: { create: items },
        },
      })
  
      /* =======================================================
         MARK TASKS INVOICED
      ======================================================= */
  
      if (dto.sourceType === 'TASKS' && validatedTasks.length) {
        await tx.task.updateMany({
          where: { id: { in: validatedTasks.map(t => t.id) } },
          data: { status: 'INVOICED' },
        })
      }
  
      return invoice
    })
  }
  
  /* ===========================
   UPDATE STATUS
=========================== */

async updateStatus(id: number, status: InvoiceStatus) {
  const invoice = await this.prisma.invoice.findUnique({
    where: { id },
  })

  if (!invoice) {
    throw new NotFoundException('Invoice not found')
  }

  if (invoice.status === 'PAID') {
    throw new BadRequestException('Paid invoice cannot be modified')
  }

  return this.prisma.invoice.update({
    where: { id },
    data: {
      status,
    },
  })
}


  /* ===========================
     ADD ITEM
  =========================== */

  async addItem(userId: number, invoiceId: number, dto: any) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    })
    if (!invoice) throw new NotFoundException('Invoice not found')
    if (invoice.status !== 'DRAFT')
      throw new BadRequestException('Invoice already sent')

    return this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        taskId: dto.taskId || null,
        title: dto.title,
        description: dto.description || null,
        quantity: Number(dto.quantity || 1),
        unitPrice: new Prisma.Decimal(Number(dto.unitPrice || 0)),
        amount: new Prisma.Decimal(
          Number(dto.quantity || 1) * Number(dto.unitPrice || 0),
        ),
      },
    })
  }

  /* ===========================
     SEND INVOICE
  =========================== */

  async sendInvoice(
    id: number,
    payload: { toEmail: string; subject?: string; message?: string },
  ) {
    const invoice = await this.findOne(id)

    if (!payload.toEmail)
      throw new BadRequestException('toEmail required')

    await this.prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: { status: 'SENT' },
      })

      const taskIds = invoice.items
        .map((i) => i.taskId)
        .filter(Boolean) as number[]

      if (taskIds.length) {
        await tx.task.updateMany({
          where: { id: { in: taskIds } },
          data: { status: 'INVOICED' },
        })
      }

      await tx.invoiceEmailLog.create({
        data: {
          invoiceId: id,
          toEmail: payload.toEmail,
          subject: payload.subject || `Invoice ${invoice.invoiceNumber}`,
          message: payload.message || '',
          status: 'SUCCESS',
        },
      })
    })

    return { ok: true }
  }

  /* ===========================
     READ
  =========================== */

  findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { id: 'desc' },
      include: {
        items: { include: { task: true } },
      },
    })
  }

  async findOne(id: number) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { include: { task: true } },
      },
    })
    if (!inv) throw new NotFoundException('Invoice not found')
    return inv
  }

  /* ===========================
     RECALCULATE
  =========================== */

  async recalculate(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { items: true },
      })

      if (!invoice) throw new NotFoundException('Invoice not found')
      if (invoice.isManualTotal) return invoice

      const computed = this.computeTotals({
        items: invoice.items.map((i) => ({
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
        gstPercent: Number(invoice.gstPercent),
        pricingMode: invoice.pricingMode,
        isIntraState: invoice.isIntraState,
        discount: Number(invoice.discount || 0),
      })

      return tx.invoice.update({
        where: { id },
        data: {
          subtotal: new Prisma.Decimal(computed.subtotal),
          cgstAmount: new Prisma.Decimal(computed.cgstAmount),
          sgstAmount: new Prisma.Decimal(computed.sgstAmount),
          igstAmount: new Prisma.Decimal(computed.igstAmount),
          total: new Prisma.Decimal(computed.total),
        },
        include: {
          items: { include: { task: true } },
        },
      })
    })
  }
  
  async createFromTasks(userId: number, dto: CreateInvoiceFromTasksDto) {
    if (!dto.taskIds || !dto.taskIds.length) {
      throw new BadRequestException('taskIds cannot be empty')
    }
  
    return this.prisma.$transaction(async (tx) => {
      /* ---------- COMPANY ---------- */
      const company = await tx.myCompany.findUnique({
        where: { id: dto.fromCompanyId },
      })
      if (!company) {
        throw new BadRequestException('Invalid company')
      }
  
      /* ---------- CLIENT ---------- */
      const client = await tx.client.findUnique({
        where: { id: dto.clientId },
      })
      if (!client) {
        throw new BadRequestException('Invalid client')
      }
  
      const isIntraState =
        dto.isIntraState ?? company.state === client.state
  
      /* ---------- FETCH TASKS ---------- */
      const tasks = await tx.task.findMany({
        where: {
          id: { in: dto.taskIds },
          clientId: dto.clientId,
        },
        include: {
          taskMaster: true,
          category: true,
        },
      })
  
      if (tasks.length !== dto.taskIds.length) {
        throw new BadRequestException(
          'Some tasks not found or do not belong to this client',
        )
      }
  
      for (const task of tasks) {
        if (task.status === 'INVOICED') {
          throw new BadRequestException(
            `Task ${task.id} already invoiced`,
          )
        }
      }
  
      /* ---------- INVOICE NUMBER ---------- */
      const invoiceNumber = await this.generateInvoiceNumber(
        tx,
        company.id,
        company.code,
      )
  
      /* ---------- INVOICE ITEMS (NO PRICING) ---------- */
      const items = tasks.map((task) => ({
        title: task.title,
        description: task.description ?? null,
        taskId: task.id,
  
        quantity: 1,
        unitPrice: new Prisma.Decimal(0),
        amount: new Prisma.Decimal(0),
  
        // metadata for GST & reporting
        hsnSac: task.taskMaster?.hsnSac ?? null,
        unit: task.taskMaster?.unitLabel ?? null,
      }))
  
      /* ---------- GST TOTALS (ZERO INITIALLY) ---------- */
      const computed = this.computeTotals({
        items: items.map(() => ({
          quantity: 1,
          unitPrice: 0,
        })),
        gstPercent: dto.gstPercent ?? 18,
        pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
        isIntraState,
        discount: dto.discount ?? 0,
      })
  
      /* ---------- CREATE INVOICE ---------- */
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          status: 'DRAFT',
  
          clientId: client.id,
          fromCompanyId: company.id,
          createdById: userId,
  
          /* ---- COMPANY SNAPSHOT ---- */
          fromCompanyName: company.name,
          fromCompanyGstin: company.gstin,
          fromCompanyCity: company.city,
          fromCompanyState: company.state,
          fromCompanyPhone: company.phone,
          fromCompanyEmail: company.email,
  
          bankName: company.bankName,
          bankAccount: company.bankAccount,
          bankIfsc: company.bankIfsc,
          bankBranch: company.bankBranch,
  
          companySealUrl: company.sealUrl,
          companySignatureUrl: company.signatureUrl,
  
          /* ---- CLIENT SNAPSHOT ---- */
          clientName: client.name,
          clientGstin: client.gstNumber,
          clientCity: client.city,
          clientState: client.state,
          clientStateCode: client.stateCode,
          clientPhone: client.phone,
          clientEmail: client.email,
  
          /* ---- GST ---- */
          gstPercent: new Prisma.Decimal(dto.gstPercent ?? 18),
          pricingMode: dto.pricingMode ?? 'EXCLUSIVE',
          isIntraState,
  
          /* ---- TOTALS ---- */
          discount: new Prisma.Decimal(dto.discount ?? 0),
  
          subtotal: new Prisma.Decimal(
            dto.isManualTotal ? dto.subtotal! : computed.subtotal,
          ),
          cgstAmount: new Prisma.Decimal(
            dto.isManualTotal ? dto.cgstAmount! : computed.cgstAmount,
          ),
          sgstAmount: new Prisma.Decimal(
            dto.isManualTotal ? dto.sgstAmount! : computed.sgstAmount,
          ),
          igstAmount: new Prisma.Decimal(
            dto.isManualTotal ? dto.igstAmount! : computed.igstAmount,
          ),
          total: new Prisma.Decimal(
            dto.isManualTotal ? dto.total! : computed.total,
          ),
  
          isManualTotal: !!dto.isManualTotal,
          notes: dto.notes ?? null,
  
          items: {
            create: items,
          },
        },
        include: {
          items: true,
        },
      })
  
      return invoice
    })
  }
  
  
}
