import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  InvoiceStatus,
  TaskStatus,
} from '@prisma/client'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: number) {
    const now = new Date()

    const next7Days = new Date()
    next7Days.setDate(now.getDate() + 7)

    const [
      taskMastersCount,
      tasksCount,
      clientsCount,
      invoicesCount,
      myPendingCount,
      overdueCount,
      pendingInvoiceAggregate,
      upcomingTasks,
      overdueTasks,
      statusBreakdown,
    ] = await Promise.all([

      /* ===========================
         TOTAL COUNTS
      =========================== */

      this.prisma.taskMaster.count({
        where: { isActive: true },
      }),

      this.prisma.task.count({
        where: { deletedAt: null },
      }),

      this.prisma.client.count(),

      this.prisma.invoice.count(),

      /* ===========================
         MY TASKS
      =========================== */

      this.prisma.task.count({
        where: {
          assignedToUserId: userId,
          status: TaskStatus.PENDING,
          deletedAt: null,
        },
      }),

      /* ===========================
         OVERDUE TASKS
      =========================== */

      this.prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: TaskStatus.PENDING,
          deletedAt: null,
        },
      }),

      /* ===========================
         🔥 PENDING INVOICE TOTAL
         (DRAFT + SENT only)
      =========================== */

      this.prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: {
            in: [InvoiceStatus.DRAFT, InvoiceStatus.SENT],
          },
        },
      }),

      /* ===========================
         UPCOMING TASKS (NEXT 7 DAYS)
      =========================== */

      this.prisma.task.findMany({
        where: {
          dueDate: {
            gte: now,
            lte: next7Days,
          },
          status: TaskStatus.PENDING,
          deletedAt: null,
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          client: true,
        },
      }),

      /* ===========================
         OVERDUE TASK LIST
      =========================== */

      this.prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          status: TaskStatus.PENDING,
          deletedAt: null,
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          client: true,
        },
      }),

      /* ===========================
         STATUS BREAKDOWN
      =========================== */

      this.prisma.task.groupBy({
        by: ['status'],
        _count: true,
        where: { deletedAt: null },
      }),
    ])

    /* ===========================
       FORMAT STATUS BREAKDOWN
    =========================== */

    const breakdown: Record<string, number> = {}

    statusBreakdown.forEach(item => {
      breakdown[item.status] = item._count
    })

    /* ===========================
       SAFE DECIMAL HANDLING
    =========================== */

    const pendingInvoiceAmount =
      pendingInvoiceAggregate._sum?.total
        ? Number(pendingInvoiceAggregate._sum.total)
        : 0

    return {
      taskMastersCount,
      tasksCount,
      clientsCount,
      invoicesCount,

      myPendingCount,
      overdueCount,

      pendingInvoiceAmount,

      upcomingTasks,
      overdueTasks,

      taskStatusBreakdown: breakdown,
    }
  }
}
