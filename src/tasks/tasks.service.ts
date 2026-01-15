import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common'
  import { PrismaService } from '../prisma/prisma.service'
  import { CreateTaskDto } from './dto/create-task.dto'
  import { UpdateTaskDto } from './dto/update-task.dto'
  import { FrequencyType, TaskStatus } from '@prisma/client'
  
  type TaskRow = any
  
  @Injectable()
  export class TasksService {
    constructor(private prisma: PrismaService) {}
  
    /* ===========================
       CREATE TASK
       - If recurring: create template + generate tasks till endDate (default 1 year)
    =========================== */
  
    async create(dto: CreateTaskDto) {
      const client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
      })
      if (!client) throw new NotFoundException('Client not found')
  
      const isRecurring = dto.isRecurring === true
  
      if (isRecurring) {
        if (!dto.frequency || !dto.interval || !dto.startDate) {
          throw new BadRequestException(
            'Recurring tasks require frequency, interval, and startDate',
          )
        }
        if (dto.interval <= 0) {
          throw new BadRequestException('interval must be >= 1')
        }
      }
  
      const startDate = isRecurring ? new Date(dto.startDate!) : null
  
      // ✅ default endDate = startDate + 1 year (if recurring and not provided)
      let endDate: Date | null = null
      if (isRecurring) {
        if (dto.endDate) endDate = new Date(dto.endDate)
        else {
          endDate = new Date(startDate!)
          endDate.setFullYear(endDate.getFullYear() + 1)
        }
  
        if (endDate && startDate && endDate < startDate) {
          throw new BadRequestException('endDate cannot be before startDate')
        }
      }
  
      // 1️⃣ CREATE TEMPLATE / NORMAL TASK
      const task = await this.prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          clientId: dto.clientId,
  
          isRecurring,
          frequency: isRecurring ? dto.frequency : null,
          interval: isRecurring ? dto.interval : null,
          startDate: isRecurring ? startDate : null,
          endDate: isRecurring ? endDate : null,
          skipWeekends: isRecurring ? (dto.skipWeekends ?? false) : false,
          isPaused: isRecurring ? (dto.isPaused ?? false) : false,
          pausedAt: isRecurring && dto.isPaused ? new Date() : null,
  
          dueDate: !isRecurring && dto.dueDate ? new Date(dto.dueDate) : null,
          status: TaskStatus.PENDING,
        },
      })
  
      // 2️⃣ ASSIGN USERS TO TEMPLATE
      if (dto.userIds?.length) {
        await this.prisma.taskAssignment.createMany({
          data: dto.userIds.map((userId) => ({
            taskId: task.id,
            userId,
          })),
          skipDuplicates: true,
        })
      }
  
      // 3️⃣ IMMEDIATELY GENERATE INSTANCES
      if (isRecurring && !task.isPaused && !task.deletedAt) {
        await this.generateRecurringInstances(task.id, { mode: 'INITIAL' })
      }
  
      return this.findOne(task.id)
    }
  
    /* ===========================
       GET ALL TASKS
       - hide templates
       - hide deleted
    =========================== */
  
    async findAll() {
      return this.prisma.task.findMany({
        where: {
          deletedAt: null,
          OR: [
            { isRecurring: false },          // normal tasks + generated tasks
            { parentTaskId: { not: null } }, // generated tasks
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      })
    }
  
    /* ===========================
       GET SINGLE TASK
    =========================== */
  
    async findOne(id: number) {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          client: true,
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      })
  
      if (!task || task.deletedAt) throw new NotFoundException('Task not found')
      return task
    }
  
    /* ===========================
       UPDATE TASK
       - Instances: cannot change recurring config
       - Templates: can update recurring config
       - Template edit triggers regenerate future instances
       - Pause/resume supported
    =========================== */
  
    async update(id: number, dto: UpdateTaskDto) {
      const task = await this.prisma.task.findUnique({ where: { id } })
      if (!task || task.deletedAt) throw new NotFoundException('Task not found')
  
      const isGeneratedInstance = !!task.parentTaskId
      const isTemplate = task.isRecurring === true && !task.parentTaskId
  
      // ❌ recurring templates cannot be completed
      if (isTemplate && dto.status === TaskStatus.COMPLETED) {
        throw new BadRequestException('Recurring task templates cannot be completed')
      }
  
      // ❌ generated tasks cannot change recurring config
      if (isGeneratedInstance) {
        if (
          dto.isRecurring !== undefined ||
          dto.frequency !== undefined ||
          dto.interval !== undefined ||
          dto.startDate !== undefined ||
          dto.endDate !== undefined ||
          dto.skipWeekends !== undefined ||
          dto.isPaused !== undefined
        ) {
          throw new BadRequestException(
            'Cannot modify recurring configuration on generated tasks',
          )
        }
      }
  
      // TEMPLATE UPDATE
      if (isTemplate) {
        const old = task
  
        const nextStart = dto.startDate ? new Date(dto.startDate) : old.startDate
        const nextEnd = dto.endDate ? new Date(dto.endDate) : old.endDate
  
        if (dto.interval !== undefined && dto.interval <= 0) {
          throw new BadRequestException('interval must be >= 1')
        }
        if (nextStart && nextEnd && nextEnd < nextStart) {
          throw new BadRequestException('endDate cannot be before startDate')
        }
  
        const pauseChanged =
          dto.isPaused !== undefined && dto.isPaused !== old.isPaused
  
        let shouldRegenerate =
          (dto.frequency !== undefined && dto.frequency !== old.frequency) ||
          (dto.interval !== undefined && dto.interval !== old.interval) ||
          (dto.startDate !== undefined &&
            nextStart?.toISOString() !== old.startDate?.toISOString()) ||
          (dto.endDate !== undefined &&
            nextEnd?.toISOString() !== old.endDate?.toISOString()) ||
          (dto.skipWeekends !== undefined && dto.skipWeekends !== old.skipWeekends)
  
        // apply template update
        await this.prisma.task.update({
          where: { id },
          data: {
            title: dto.title,
            description: dto.description,
            status: dto.status,
  
            frequency: dto.frequency,
            interval: dto.interval,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            skipWeekends: dto.skipWeekends,
  
            isPaused: dto.isPaused,
            pausedAt: pauseChanged
              ? (dto.isPaused ? new Date() : null)
              : undefined,
          },
        })
  
        // template assignments
        if (dto.userIds) {
          await this.prisma.taskAssignment.deleteMany({ where: { taskId: id } })
          await this.prisma.taskAssignment.createMany({
            data: dto.userIds.map((userId) => ({ taskId: id, userId })),
            skipDuplicates: true,
          })
          shouldRegenerate = true // ensure future instances pick up assignments
        }
  
        // ✅ regenerate / resume behavior
        if (shouldRegenerate) {
          await this.regenerateTemplateFutureInstances(id)
        } else if (pauseChanged && dto.isPaused === false) {
          await this.generateRecurringInstances(id, { mode: 'FILL_GAPS' })
        }
  
        return this.findOne(id)
      }
  
      // NORMAL TASK / INSTANCE UPDATE
      await this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          status: dto.status,
          completedAt:
            dto.status === TaskStatus.COMPLETED ? new Date() : undefined,
        },
      })
  
      if (dto.userIds) {
        await this.prisma.taskAssignment.deleteMany({ where: { taskId: id } })
        await this.prisma.taskAssignment.createMany({
          data: dto.userIds.map((userId) => ({ taskId: id, userId })),
          skipDuplicates: true,
        })
      }
  
      return this.findOne(id)
    }
  
    /* ===========================
       DELETE TASK
       - Template: soft delete
       - Normal/instance: hard delete
    =========================== */
  
    async remove(id: number) {
      const task = await this.prisma.task.findUnique({ where: { id } })
      if (!task) throw new NotFoundException('Task not found')
  
      const isTemplate = task.isRecurring === true && !task.parentTaskId
  
      if (isTemplate) {
        await this.prisma.task.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            isPaused: true,
            pausedAt: new Date(),
          },
        })
        return { success: true, message: 'Recurring template soft-deleted (instances kept)' }
      }
  
      await this.prisma.taskAssignment.deleteMany({ where: { taskId: id } })
      return this.prisma.task.delete({ where: { id } })
    }
  
    /* ===========================
       INTERNAL: REGENERATION
       - delete future pending instances, keep completed
       - generate again to endDate
    =========================== */
  
    private async regenerateTemplateFutureInstances(templateId: number) {
      const template = await this.prisma.task.findUnique({
        where: { id: templateId },
      })
      if (!template || template.deletedAt) return
      if (template.isPaused) return
  
      const now = new Date()
  
      await this.prisma.task.deleteMany({
        where: {
          parentTaskId: templateId,
          deletedAt: null,
          dueDate: { gte: now },
          status: { not: TaskStatus.COMPLETED },
        },
      })
  
      await this.generateRecurringInstances(templateId, { mode: 'FILL_GAPS' })
    }
  
    /* ===========================
       INTERNAL: GENERATE
       - INITIAL => from startDate
       - FILL_GAPS => from next occurrence after now
    =========================== */
  
    private async generateRecurringInstances(
      templateId: number,
      opts: { mode: 'INITIAL' | 'FILL_GAPS' },
    ) {
      const template = await this.prisma.task.findUnique({
        where: { id: templateId },
        include: { assignments: true },
      })
  
      if (!template || template.deletedAt) return
      if (!template.startDate || !template.frequency) return
      if (template.isPaused) return
  
      const interval = template.interval ?? 1
      if (interval <= 0) return
  
      const start = new Date(template.startDate)
      const end = template.endDate ? new Date(template.endDate) : this.addOneYear(start)
      if (end < start) return
  
      const now = new Date()
      const genStart =
        opts.mode === 'INITIAL' ? start : this.getNextOccurrenceAfterNow(template, now)
  
      if (!genStart) return
  
      const occurrences = this.buildOccurrences(template, genStart, end)
  
      for (const raw of occurrences) {
        const dueDate = template.skipWeekends ? this.shiftIfWeekend(raw) : raw
  
        const exists = await this.prisma.task.findFirst({
          where: {
            parentTaskId: template.id,
            dueDate,
            deletedAt: null,
          },
          select: { id: true },
        })
        if (exists) continue
  
        const instance = await this.prisma.task.create({
          data: {
            title: template.title,
            description: template.description,
            clientId: template.clientId,
  
            parentTaskId: template.id,
            isRecurring: false,
  
            dueDate,
            status: TaskStatus.PENDING,
          },
        })
  
        if (template.assignments.length) {
          await this.prisma.taskAssignment.createMany({
            data: template.assignments.map((a) => ({
              taskId: instance.id,
              userId: a.userId,
            })),
            skipDuplicates: true,
          })
        }
      }
    }
  
    /* ===========================
       HELPERS
    =========================== */
  
    private addOneYear(d: Date) {
      const x = new Date(d)
      x.setFullYear(x.getFullYear() + 1)
      return x
    }
  
    private shiftIfWeekend(d: Date) {
      const x = new Date(d)
      const day = x.getDay() // 0 Sun, 6 Sat
      if (day === 6) x.setDate(x.getDate() + 2)
      if (day === 0) x.setDate(x.getDate() + 1)
      return x
    }
  
    private buildOccurrences(template: TaskRow, from: Date, to: Date): Date[] {
      const out: Date[] = []
      const interval = template.interval ?? 1
      let cursor = new Date(from)
  
      while (cursor <= to) {
        out.push(new Date(cursor))
  
        switch (template.frequency as FrequencyType) {
          case FrequencyType.DAILY:
            cursor.setDate(cursor.getDate() + interval)
            break
          case FrequencyType.WEEKLY:
            cursor.setDate(cursor.getDate() + interval * 7)
            break
          case FrequencyType.MONTHLY:
            cursor.setMonth(cursor.getMonth() + interval)
            break
          case FrequencyType.YEARLY:
            cursor.setFullYear(cursor.getFullYear() + interval)
            break
          default:
            return out
        }
      }
  
      return out
    }
  
    private getNextOccurrenceAfterNow(template: TaskRow, now: Date): Date | null {
      if (!template.startDate || !template.frequency) return null
  
      const interval = template.interval ?? 1
      let next = new Date(template.startDate)
  
      while (next <= now) {
        switch (template.frequency as FrequencyType) {
          case FrequencyType.DAILY:
            next.setDate(next.getDate() + interval)
            break
          case FrequencyType.WEEKLY:
            next.setDate(next.getDate() + interval * 7)
            break
          case FrequencyType.MONTHLY:
            next.setMonth(next.getMonth() + interval)
            break
          case FrequencyType.YEARLY:
            next.setFullYear(next.getFullYear() + interval)
            break
          default:
            return null
        }
      }
  
      return next
    }
  }
  