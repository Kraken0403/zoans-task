import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import * as XLSX from 'xlsx'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /* ========================
     CRUD
  ======================== */

  async create(dto: CreateClientDto) {
    const exists = await this.prisma.client.findFirst({
      where: {
        OR: [
          { code: dto.code },
          dto.email ? { email: dto.email } : undefined,
        ].filter(Boolean) as any,
      },
    })

    if (exists) {
      throw new BadRequestException(
        'Client with same code or email already exists',
      )
    }

    return this.prisma.client.create({
      data: {
        code: dto.code,
        name: dto.name,
        email: dto.email || null,
        phone: dto.phone || null,

        addressLine1: dto.addressLine1 || null,
        addressLine2: dto.addressLine2 || null,
        city: dto.city || null,
        state: dto.state || null,
        pincode: dto.pincode || null,

        gstNumber: dto.gstNumber || null,
      },
    })
  }

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        tasks: true,
        invoices: true,
      },
    })
  }

  async update(id: number, dto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,

        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,

        gstNumber: dto.gstNumber,
      },
    })
  }

  async remove(id: number) {
    return this.prisma.client.delete({
      where: { id },
    })
  }

  /* ========================
     EXCEL IMPORT
  ======================== */

  async importFromExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any>(sheet)

    let created = 0
    let skipped = 0

    for (const row of rows) {
      const rawCode =
        row['Client Code'] ||
        row['Code'] ||
        row['ClientCode']

      const rawName =
        row['Client Name'] ||
        row['Name']

      if (!rawCode || !rawName) {
        skipped++
        continue
      }

      const code = rawCode.toString().trim()
      const name = rawName.toString().trim()

      const exists = await this.prisma.client.findUnique({
        where: { code },
      })

      if (exists) {
        skipped++
        continue
      }

      await this.prisma.client.create({
        data: {
          code, // ✅ FIXED
          name,

          email: row['Email']?.toString().trim() || null,
          phone: row['Phone']?.toString().trim() || null,

          addressLine1: row['Address Line 1']?.toString().trim() || null,
          addressLine2: row['Address Line 2']?.toString().trim() || null,
          city: row['City']?.toString().trim() || null,
          state: row['State']?.toString().trim() || null,
          pincode: row['Pincode']?.toString().trim() || null,

          gstNumber: row['GST']?.toString().trim() || null,
        },
      })

      created++
    }

    return {
      totalRows: rows.length,
      created,
      skipped,
    }
  }
}
