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
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { InvoicesService } from './invoices.service'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { InvoicePdfService } from './pdf/invoice-pdf.service'
import { InvoiceStatus } from '@prisma/client' 

@UseGuards(AuthGuard('jwt'))
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly svc: InvoicesService, 
    private readonly pdfService: InvoicePdfService,
  ) {}

  @Post(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Res() res,
  ) {
    const pdf = await this.pdfService.generate(Number(id))

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=invoice-${id}.pdf`,
    })

    res.send(pdf)
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.svc.create(req.user.id, dto)
  }

  @Get()
  findAll() {
    return this.svc.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id))
  }

  @Post(':id/items')
  addItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.svc.addItem(req.user.id, Number(id), dto)
  }

  @Post(':id/send')
  send(
    @Param('id') id: string,
    @Body() dto: { toEmail: string; subject?: string; message?: string },
  ) {
    return this.svc.sendInvoice(Number(id), dto)
  }

  @Post(':id/recalculate')
  recalculate(@Param('id') id: string) {
    return this.svc.recalculate(Number(id))
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.svc.updateStatus(Number(id), status) // ✅ FIX 2
  }
}
