import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskStatus } from '@prisma/client'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------- CREATE (Ad-hoc only) --------------------

  async create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        clientId: dto.clientId,
        categoryId: dto.categoryId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedToUserId: dto.assignedToUserId ?? null,
      },
    })
  }

  // -------------------- LIST / FILTER --------------------

  async findAll(filters: {
    clientId?: number
    assignedToUserId?: number
    categoryId?: number
    status?: string
  }) {
    const where: any = {}

    if (filters.clientId) {
      where.clientId = filters.clientId
    }

    if (filters.assignedToUserId) {
      where.assignedToUserId = filters.assignedToUserId
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    // 🔥 IMPORTANT: sanitize status
    if (
      filters.status &&
      typeof filters.status === 'string' &&
      filters.status.trim() !== ''
    ) {
      where.status = filters.status.trim() as TaskStatus
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },

      ],
      include: {
        client: true,
        category: true,
        assignedToUser: true,
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }
      },
    })
  }

  // -------------------- GET ONE --------------------

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        client: true,
        category: true,
        assignedToUser: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
    })

    if (!task) throw new NotFoundException('Task not found')
    return task
  }
  
  async findByIds(ids: number[]) {
    return this.prisma.task.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: {
        client: true,
        taskMaster: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    })
  }
  

  // -------------------- UPDATE --------------------

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
  
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Update task fields
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.dueDate !== undefined
            ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
            : {}),
        },
      })
  
      // 2️⃣ Replace assignments (if sent)
      if (dto.userIds) {
        await tx.taskAssignment.deleteMany({
          where: { taskId: id },
        })
  
        if (dto.userIds.length) {
          await tx.taskAssignment.createMany({
            data: dto.userIds.map((userId) => ({
              taskId: id,
              userId,
            })),
          })
  
          // Optional: keep primary assigned user
          await tx.task.update({
            where: { id },
            data: { assignedToUserId: dto.userIds[0] },
          })
        }
      }
  
      return updatedTask
    })
  }
  

  // -------------------- ASSIGNMENT --------------------

  async assign(taskId: number, userId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new NotFoundException('Task not found')

    await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { assignedToUserId: userId },
      }),
      this.prisma.taskAssignment.create({
        data: {
          taskId,
          userId,
        },
      }),
    ])

    return { success: true }
  }

  async bulkAssign(taskIds: number[], userId: number) {
    if (!taskIds.length) {
      throw new BadRequestException('taskIds cannot be empty')
    }

    await this.prisma.$transaction([
      this.prisma.task.updateMany({
        where: { id: { in: taskIds } },
        data: { assignedToUserId: userId },
      }),
      this.prisma.taskAssignment.createMany({
        data: taskIds.map((taskId) => ({
          taskId,
          userId,
        })),
      }),
    ])

    return { success: true, count: taskIds.length }
  }
}
