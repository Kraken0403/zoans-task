import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MyCompaniesService {
  constructor(private prisma: PrismaService) {}

  create(ownerId: number, dto: any) {
    return this.prisma.myCompany.create({ data: { ...dto, ownerId } })
  }

  findAll(ownerId: number) {
    return this.prisma.myCompany.findMany({ where: { ownerId }, orderBy: { id: 'desc' } })
  }

  async findOne(ownerId: number, id: number) {
    const c = await this.prisma.myCompany.findFirst({ where: { id, ownerId } })
    if (!c) throw new NotFoundException('Company not found')
    return c
  }

  update(ownerId: number, id: number, dto: any) {
    return this.prisma.myCompany.update({ where: { id }, data: dto })
  }

  remove(ownerId: number, id: number) {
    return this.prisma.myCompany.delete({ where: { id } })
  }
  
  async uploadSeal(ownerId: number, companyId: number, file: Express.Multer.File) {
    const company = await this.findOne(ownerId, companyId)
  
    const url = `/uploads/companies/${companyId}/seal.png`
  
    // save file to disk / s3 / cloudinary here
  
    return this.prisma.myCompany.update({
      where: { id: companyId },
      data: { sealUrl: url },
    })
  }
  
  async uploadSignature(ownerId: number, companyId: number, file: Express.Multer.File) {
    const company = await this.findOne(ownerId, companyId)
  
    const url = `/uploads/companies/${companyId}/signature.png`
  
    return this.prisma.myCompany.update({
      where: { id: companyId },
      data: { signatureUrl: url },
    })
  }
  
}
