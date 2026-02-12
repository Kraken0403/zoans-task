import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Res,
  Patch,
  ParseIntPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { InvoicesService } from './invoices.service'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { CreateInvoiceFromTasksDto } from './dto/create-invoice-from-tasks.dto'
import { InvoicePdfService } from './pdf/invoice-pdf.service'
import { InvoiceStatus } from '@prisma/client'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto'

@ApiTags('Task Masters')
@ApiBearerAuth('access-token') 
@UseGuards(AuthGuard('jwt'))
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly svc: InvoicesService,
    private readonly pdfService: InvoicePdfService,
  ) {}

  /* ===========================
     CREATE (MANUAL)
  =========================== */

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.svc.create(req.user.id, dto)
  }

  /* ===========================
     CREATE FROM TASKS 🔥
  =========================== */

  @Post('from-tasks')
  createFromTasks(
    @Req() req: any,
    @Body() dto: CreateInvoiceFromTasksDto,
  ) {
    return this.svc.createFromTasks(req.user.id, dto)
  }

  /* ===========================
     PDF
  =========================== */

  @Post(':id/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res,
  ) {
    const pdf = await this.pdfService.generate(id)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=invoice-${id}.pdf`,
    })

    res.send(pdf)
  }

  /* ===========================
     READ
  =========================== */

  @Get()
  findAll() {
    return this.svc.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id)
  }

  /* ===========================
     ITEMS (MANUAL ADD)
  =========================== */


  @Post(':id/items')
  addItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddInvoiceItemDto,   // ✅ typed DTO
  ) {
    return this.svc.addItem(req.user.id, Number(id), dto)
  }

  /* ===========================
     SEND
  =========================== */

  @Post(':id/send')
  send(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { toEmail: string; subject?: string; message?: string },
  ) {
    return this.svc.sendInvoice(id, dto)
  }

  /* ===========================
     RECALCULATE
  =========================== */

  @Post(':id/recalculate')
  recalculate(@Param('id', ParseIntPipe) id: number) {
    return this.svc.recalculate(id)
  }

  /* ===========================
     STATUS
  =========================== */

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.svc.updateStatus(id, status)
  }
}
