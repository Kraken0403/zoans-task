import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClientGroupDto } from './dto/create-client-group.dto'
import { UpdateClientGroupDto } from './dto/update-client-group.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ClientGroupsService {
  constructor(private prisma: PrismaService) {}

  /* ========================
     CREATE
  ======================== */

  async create(dto: CreateClientGroupDto) {
    const exists = await this.prisma.clientGroup.findFirst({
      where: {
        OR: [{ code: dto.code }, { name: dto.name }],
      },
    })

    if (exists) {
      throw new BadRequestException(
        'Client group with same code or name already exists',
      )
    }

    return this.prisma.clientGroup.create({
      data: {
        name: dto.name,
        code: dto.code,
      },
    })
  }

  /* ========================
     READ
  ======================== */

  async findAll() {
    return this.prisma.clientGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        clients: true,
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.clientGroup.findUnique({
      where: { id },
      include: {
        clients: true,
      },
    })
  }

  /* ========================
     UPDATE
  ======================== */
  async update(id: number, dto: UpdateClientGroupDto) {
    // 1️⃣ Check if group exists
    const existing = await this.prisma.clientGroup.findUnique({
      where: { id },
    })
  
    if (!existing) {
      throw new BadRequestException('Client group not found')
    }
  
    // 2️⃣ Build OR conditions safely (TypeScript-safe)
    if (dto.code !== undefined || dto.name !== undefined) {
      const orConditions: Prisma.ClientGroupWhereInput[] = []
  
      if (dto.code !== undefined) {
        orConditions.push({ code: dto.code })
      }
  
      if (dto.name !== undefined) {
        orConditions.push({ name: dto.name })
      }
  
      const duplicate = await this.prisma.clientGroup.findFirst({
        where: {
          id: { not: id },
          OR: orConditions,
        },
      })
  
      if (duplicate) {
        throw new BadRequestException(
          'Client group with same code or name already exists',
        )
      }
    }
  
    // 3️⃣ Update only provided fields
    return this.prisma.clientGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
      },
    })
  }
  

  /* ========================
     DELETE
  ======================== */

  async remove(id: number) {
    // 🔒 SAFETY: group deletion should NOT delete clients
    return this.prisma.clientGroup.delete({
      where: { id },
    })
  }

  async assignClientsToGroup(groupId: number, clientIds: number[]) {
    const group = await this.prisma.clientGroup.findUnique({
      where: { id: groupId },
    })
  
    if (!group) {
      throw new BadRequestException('Client group not found')
    }
  
    // 1️⃣ Fetch selected clients
    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
      select: {
        id: true,
        clientGroupId: true,
      },
    })
  
    // 2️⃣ Find conflicting clients
    const conflicting = clients.filter(
      c => c.clientGroupId && c.clientGroupId !== groupId,
    )
  
    if (conflicting.length > 0) {
      throw new BadRequestException(
        'One or more clients already belong to another group',
      )
    }
  
    // 3️⃣ Safe to assign
    await this.prisma.client.updateMany({
      where: {
        id: { in: clientIds },
      },
      data: {
        clientGroupId: groupId,
      },
    })
  
    return { success: true }
  }
  

  async removeClientsFromGroup(clientIds: number[]) {
    if (!clientIds || !clientIds.length) {
      throw new BadRequestException('No clients selected')
    }
  
    await this.prisma.client.updateMany({
      where: {
        id: { in: clientIds },
      },
      data: {
        clientGroupId: null,
      },
    })
  
    return { success: true }
  }
  
  
}
