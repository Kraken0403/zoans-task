import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { FrequencyType, TaskStatus } from '@prisma/client'

@Injectable()
export class RecurringTasksService {
  private readonly logger = new Logger(RecurringTasksService.name)

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Kolkata' })
  async handleRecurringTasks() {
    this.logger.log('Running recurring task maintenance cron')

    const templates = await this.prisma.task.findMany({
      where: {
        isRecurring: true,
        parentTaskId: null,
        deletedAt: null,
        isPaused: false,
      },
      include: { assignments: true },
    })

    const now = new Date()
    const lookAhead = new Date()
    lookAhead.setMonth(lookAhead.getMonth() + 2)

    for (const template of templates) {
      if (!template.startDate || !template.frequency) continue

      const endLimit = template.endDate
        ? new Date(Math.min(new Date(template.endDate).getTime(), lookAhead.getTime()))
        : lookAhead

      if (endLimit < now) continue

      let next = new Date(template.startDate)
      const interval = template.interval ?? 1

      // move to first future
      while (next <= now) {
        next = step(next, template.frequency, interval)
      }

      while (next <= endLimit) {
        const dueDate = template.skipWeekends ? shiftIfWeekend(next) : new Date(next)

        const exists = await this.prisma.task.findFirst({
          where: {
            parentTaskId: template.id,
            dueDate,
            deletedAt: null,
          },
          select: { id: true },
        })

        if (!exists) {
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

          this.logger.log(`Generated task ${instance.id} from template ${template.id}`)
        }

        next = step(next, template.frequency, interval)
      }
    }

    function step(d: Date, freq: FrequencyType, interval: number) {
      const x = new Date(d)
      switch (freq) {
        case FrequencyType.DAILY:
          x.setDate(x.getDate() + interval)
          break
        case FrequencyType.WEEKLY:
          x.setDate(x.getDate() + interval * 7)
          break
        case FrequencyType.MONTHLY:
          x.setMonth(x.getMonth() + interval)
          break
        case FrequencyType.YEARLY:
          x.setFullYear(x.getFullYear() + interval)
          break
      }
      return x
    }

    function shiftIfWeekend(d: Date) {
      const x = new Date(d)
      const day = x.getDay()
      if (day === 6) x.setDate(x.getDate() + 2)
      if (day === 0) x.setDate(x.getDate() + 1)
      return x
    }
  }
}
