import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClientGroupDto } from './dto/create-client-group.dto'
import { UpdateClientGroupDto } from './dto/update-client-group.dto'

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
    return this.prisma.clientGroup.update({
      where: { id },
      data: {
        name: dto.name,
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
    // check group exists
    const group = await this.prisma.clientGroup.findUnique({
      where: { id: groupId },
    })
  
    if (!group) {
      throw new BadRequestException('Client group not found')
    }
  
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
