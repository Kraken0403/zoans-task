import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    data.password = await bcrypt.hash(data.password, 10)
    return this.prisma.user.create({ data })
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true },
    })
  }
}
