import { Module } from '@nestjs/common'
import { InvoicesController } from './invoices.controller'
import { InvoicesService } from './invoices.service'
import { PrismaModule } from '../prisma/prisma.module'
import { InvoicePdfService } from './pdf/invoice-pdf.service'

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
})
export class InvoicesModule {}
