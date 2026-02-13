import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskMasterDto } from './dto/create-task-master.dto'
import { UpdateTaskMasterDto } from './dto/update-task-master.dto'
import { AssignClientsDto } from './dto/assign-clients.dto'
import { GenerateTasksDto } from './dto/generate-tasks.dto'
import { FrequencyType, Prisma } from '@prisma/client'

// import { TaskMaster } from '@prisma/client'

import * as XLSX from 'xlsx'


@Injectable()
export class TaskMastersService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------- CRUD --------------------

  async create(dto: CreateTaskMasterDto) {
    // Basic validation: startDate <= endDate
    if (dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('endDate cannot be before startDate')
    }

    

    return this.prisma.taskMaster.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        frequency: dto.frequency,
        interval: dto.interval ?? null,
        financialYear: dto.financialYear ?? null,
        defaultDueDay: dto.defaultDueDay ?? null,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
            // 🔥 billing
        isBillable: dto.isBillable ?? false,
        hsnSac: dto.hsnSac ?? null,
        gstRate: dto.gstRate ?? null,
        unitLabel: dto.unitLabel ?? null,
        

      },
    })
  }

  async findAll(filters: {
    isActive?: boolean
    categoryId?: number
  }) {
    return this.prisma.taskMaster.findMany({
      where: {
        ...(typeof filters.isActive === 'boolean' ? { isActive: filters.isActive } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        clients: {
          include: {
            client: true,
          },
        },
        _count: {
          select: { tasks: true, clients: true },
        },
      },
    })
  }

  async findOne(id: number) {
    const master = await this.prisma.taskMaster.findUnique({
      where: { id },
      include: {
        category: true,
        clients: { include: { client: true } },
        _count: { select: { tasks: true, clients: true } },
      },
    })
    if (!master) throw new NotFoundException('TaskMaster not found')
    return master
  }

  async update(id: number, dto: UpdateTaskMasterDto) {
    const existing = await this.prisma.taskMaster.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('TaskMaster not found')

    if (dto.startDate && dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('endDate cannot be before startDate')
    }

    return this.prisma.taskMaster.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.interval !== undefined ? { interval: dto.interval } : {}),
        ...(dto.financialYear !== undefined ? { financialYear: dto.financialYear } : {}),
        ...(dto.defaultDueDay !== undefined ? { defaultDueDay: dto.defaultDueDay } : {}),
        ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isBillable !== undefined ? { isBillable: dto.isBillable } : {}),
        ...(dto.hsnSac !== undefined ? { hsnSac: dto.hsnSac } : {}),
        ...(dto.gstRate !== undefined ? { gstRate: dto.gstRate } : {}),
        ...(dto.unitLabel !== undefined ? { unitLabel: dto.unitLabel } : {}),

      },
    })
  }

  async disable(id: number) {
    const existing = await this.prisma.taskMaster.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('TaskMaster not found')

    return this.prisma.taskMaster.update({
      where: { id },
      data: { isActive: false },
    })
  }

  // -------------------- CLIENT ASSIGNMENTS --------------------

  async assignClients(taskMasterId: number, dto: AssignClientsDto) {
    const master = await this.prisma.taskMaster.findUnique({ where: { id: taskMasterId } })
    if (!master) throw new NotFoundException('TaskMaster not found')

    if (!dto.clientIds?.length) {
      throw new BadRequestException('clientIds is required')
    }

    // Upsert each link (safe if already assigned)
    const ops = dto.clientIds.map((clientId) =>
      this.prisma.taskMasterClient.upsert({
        where: { taskMasterId_clientId: { taskMasterId, clientId } },
        create: {
          taskMasterId,
          clientId,
          customDueDay: dto.customDueDay ?? null,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          isActive: dto.isActive ?? true,
        },
        update: {
          ...(dto.customDueDay !== undefined ? { customDueDay: dto.customDueDay } : {}),
          ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
          ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      }),
    )

    await this.prisma.$transaction(ops)

    return this.findOne(taskMasterId)
  }

  async unassignClient(taskMasterId: number, clientId: number) {
    // hard delete link (simple). If you want history, switch to isActive=false.
    await this.prisma.taskMasterClient.delete({
      where: { taskMasterId_clientId: { taskMasterId, clientId } },
    })
    return { success: true }
  }

  // -------------------- GENERATION (BUTTON) --------------------
  private async generateEventBasedTasks(
    master: any,
    assignedToUserId: number | undefined,
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  ) {
    const existingTasks = await this.prisma.task.findMany({
      where: {
        taskMasterId: master.id,
        clientId: { in: master.clients.map(c => c.clientId) },
      },
      select: { clientId: true },
    })
  
    const existingClientIds = new Set(existingTasks.map(t => t.clientId))
  
    let created = 0
    let skipped = 0
  
    for (const link of master.clients) {
      if (!link.isActive) continue
      if (existingClientIds.has(link.clientId)) {
        skipped++
        continue
      }
  
      await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
          data: {
            title: master.title,
            description: master.description ?? null,
            clientId: link.clientId,
            status: 'PENDING',
            taskMasterId: master.id,
            categoryId: master.categoryId,
  
            isBillable: finalIsBillable,
            hsnSac: finalIsBillable ? finalHsnSac : null,
            gstRate: finalIsBillable ? finalGstRate : null,
            unitLabel: finalIsBillable ? finalUnitLabel : null,
  
            dueDate: null,
          },
        })
  
        if (assignedToUserId) {
          await tx.taskAssignment.create({
            data: { taskId: task.id, userId: assignedToUserId },
          })
        }
      })
  
      created++
    }
  
    return { success: true, type: 'EVENT_BASED', created, skipped }
  }
  
  

  private parseFinancialYear(financialYear: string) {
    // "2025-26" -> startYear=2025 endYear=2026
    const parts = String(financialYear).trim().split('-')
    const fyStartYear = Number(parts[0])
    if (!fyStartYear || fyStartYear < 2000 || fyStartYear > 2100) {
      throw new BadRequestException('Invalid financialYear format (expected 2025-26)')
    }
    return { fyStartYear, fyEndYear: fyStartYear + 1 }
  }
  
  private getFyRange(financialYear: string) {
    const { fyStartYear, fyEndYear } = this.parseFinancialYear(financialYear)
    const start = new Date(Date.UTC(fyStartYear, 3, 1, 0, 0, 0)) // Apr 1
    const end = new Date(Date.UTC(fyEndYear, 2, 31, 23, 59, 59)) // Mar 31
    return { start, end, fyStartYear, fyEndYear }
  }
  
  private maxDate(a: Date, b: Date) {
    return a.getTime() > b.getTime() ? a : b
  }
  
  private minDate(a: Date, b: Date) {
    return a.getTime() < b.getTime() ? a : b
  }
  
  private eachUtcDay(start: Date, end: Date) {
    const days: Date[] = []
    const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0))
    const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 0, 0, 0))
  
    while (cur.getTime() <= last.getTime()) {
      days.push(new Date(cur))
      cur.setUTCDate(cur.getUTCDate() + 1)
    }
    return days
  }
  
  private monthRangeUTC(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59))
    return { start, end }
  }
  
  private quarterRangeUTC(fyStartYear: number, quarter: number) {
    // FY Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar
    const q = Number(quarter)
    if (![1, 2, 3, 4].includes(q)) throw new BadRequestException('quarter must be 1..4')
  
    if (q === 1) return { start: new Date(Date.UTC(fyStartYear, 3, 1)), end: new Date(Date.UTC(fyStartYear, 6, 0, 23, 59, 59)) }
    if (q === 2) return { start: new Date(Date.UTC(fyStartYear, 6, 1)), end: new Date(Date.UTC(fyStartYear, 9, 0, 23, 59, 59)) }
    if (q === 3) return { start: new Date(Date.UTC(fyStartYear, 9, 1)), end: new Date(Date.UTC(fyStartYear, 12, 0, 23, 59, 59)) }
    // q === 4 (Jan-Mar of next calendar year)
    return { start: new Date(Date.UTC(fyStartYear + 1, 0, 1)), end: new Date(Date.UTC(fyStartYear + 1, 3, 0, 23, 59, 59)) }
  }
  
  private clampToMasterAndLinkRange(
    masterStart: Date,
    masterEnd: Date | null,
    linkStart: Date | null,
    linkEnd: Date | null,
    rangeStart: Date,
    rangeEnd: Date
  ) {
    let start = this.maxDate(rangeStart, masterStart)
    let end = masterEnd ? this.minDate(rangeEnd, masterEnd) : rangeEnd
  
    if (linkStart) start = this.maxDate(start, linkStart)
    if (linkEnd) end = this.minDate(end, linkEnd)
  
    if (end.getTime() < start.getTime()) return null
    return { start, end }
  }

  private async generateDailyTasks(
    master: any,
    dto: GenerateTasksDto,
    activeClientLinks: any[],
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  )
  {
    if (!dto.financialYear) {
      throw new BadRequestException('financialYear is required for DAILY generation')
    }
  
    const fy = this.getFyRange(dto.financialYear)
    let rangeStart = fy.start
    let rangeEnd = fy.end
    let periodKey = dto.financialYear
  
    // Optional: month narrowing (inside FY)
    if (dto.month) {
      // month is calendar month; clamp by month range and FY range
      // We choose the calendar year based on FY: Apr-Dec => fyStartYear, Jan-Mar => fyEndYear
      const m = dto.month
      const yearForMonth = m >= 4 ? fy.fyStartYear : fy.fyEndYear
      const mr = this.monthRangeUTC(yearForMonth, m)
      rangeStart = this.maxDate(rangeStart, mr.start)
      rangeEnd = this.minDate(rangeEnd, mr.end)
      periodKey = `${dto.financialYear}-${String(m).padStart(2, '0')}`
    }
  
    const masterStart = new Date(master.startDate)
    const masterEnd = master.endDate ? new Date(master.endDate) : null
  
    // Pull existing tasks in range to avoid duplicates (per client+dueDate)
    const existing = await this.prisma.task.findMany({
      where: {
        taskMasterId: master.id,
        dueDate: { gte: rangeStart, lte: rangeEnd },
        clientId: { in: activeClientLinks.map(l => l.clientId) },
      },
      select: { clientId: true, dueDate: true },
    })
    const existsSet = new Set(existing.map(x => `${x.clientId}::${new Date(x.dueDate!).toISOString().slice(0,10)}`))
  
    let created = 0
    let skippedExisting = 0
  
    for (const link of activeClientLinks) {
      const linkStart = link.startDate ? new Date(link.startDate) : null
      const linkEnd = link.endDate ? new Date(link.endDate) : null
  
      const clamped = this.clampToMasterAndLinkRange(masterStart, masterEnd, linkStart, linkEnd, rangeStart, rangeEnd)
      if (!clamped) continue
  
      const days = this.eachUtcDay(clamped.start, clamped.end)
  
      for (const d of days) {
        const dueDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
        const key = `${link.clientId}::${dueDate.toISOString().slice(0,10)}`
  
        if (existsSet.has(key)) {
          skippedExisting++
          continue
        }
  
        await this.prisma.$transaction(async (tx) => {
          const task = await tx.task.create({
            data: {
              title: `${master.title} - ${periodKey}`,
              description: master.description ?? null,
              clientId: link.clientId,
              status: 'PENDING',
              taskMasterId: master.id,
              categoryId: master.categoryId,
              isBillable: finalIsBillable,
              hsnSac: finalIsBillable ? finalHsnSac : null,
              gstRate: finalIsBillable ? finalGstRate : null,
              unitLabel: finalIsBillable ? finalUnitLabel : null,
              
              periodStart: rangeStart,
              periodEnd: rangeEnd,
              dueDate,
            },
          })
  
          if (dto.assignedToUserId) {
            await tx.taskAssignment.create({
              data: { taskId: task.id, userId: dto.assignedToUserId },
            })
          }
        })
  
        existsSet.add(key)
        created++
      }
    }
  
    return {
      success: true,
      taskMasterId: master.id,
      period: { periodKey, periodStart: rangeStart, periodEnd: rangeEnd },
      results: { created, skippedExisting },
    }
  }
  
  private async generateWeeklyTasks(
    master: any,
    dto: GenerateTasksDto,
    activeClientLinks: any[],
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  ) {
    if (!dto.financialYear) {
      throw new BadRequestException('financialYear is required for WEEKLY generation')
    }
  
    const fy = this.getFyRange(dto.financialYear)
    let rangeStart = fy.start
    let rangeEnd = fy.end
    let periodKey = dto.financialYear
  
    if (dto.month) {
      const m = dto.month
      const yearForMonth = m >= 4 ? fy.fyStartYear : fy.fyEndYear
      const mr = this.monthRangeUTC(yearForMonth, m)
      rangeStart = this.maxDate(rangeStart, mr.start)
      rangeEnd = this.minDate(rangeEnd, mr.end)
      periodKey = `${dto.financialYear}-${String(m).padStart(2, '0')}`
    }
  
    const masterStart = new Date(master.startDate)
    const masterEnd = master.endDate ? new Date(master.endDate) : null
  
    const existing = await this.prisma.task.findMany({
      where: {
        taskMasterId: master.id,
        dueDate: { gte: rangeStart, lte: rangeEnd },
        clientId: { in: activeClientLinks.map(l => l.clientId) },
      },
      select: { clientId: true, dueDate: true },
    })
    const existsSet = new Set(existing.map(x => `${x.clientId}::${new Date(x.dueDate!).toISOString().slice(0,10)}`))
  
    let created = 0
    let skippedExisting = 0
  
    for (const link of activeClientLinks) {
      const linkStart = link.startDate ? new Date(link.startDate) : null
      const linkEnd = link.endDate ? new Date(link.endDate) : null
  
      const clamped = this.clampToMasterAndLinkRange(masterStart, masterEnd, linkStart, linkEnd, rangeStart, rangeEnd)
      if (!clamped) continue
  
      // weekly anchor: every Monday within range
      const days = this.eachUtcDay(clamped.start, clamped.end)
      const mondays = days.filter(d => d.getUTCDay() === 1)
  
      for (const d of mondays) {
        const dueDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
        const key = `${link.clientId}::${dueDate.toISOString().slice(0,10)}`
  
        if (existsSet.has(key)) {
          skippedExisting++
          continue
        }
  
        await this.prisma.$transaction(async (tx) => {
          const task = await tx.task.create({
            data: {
              title: `${master.title} - ${periodKey}`,
              description: master.description ?? null,
              clientId: link.clientId,
              status: 'PENDING',
              taskMasterId: master.id,
              categoryId: master.categoryId,
              isBillable: finalIsBillable,
              hsnSac: finalIsBillable ? finalHsnSac : null,
              gstRate: finalIsBillable ? finalGstRate : null,
              unitLabel: finalIsBillable ? finalUnitLabel : null,

              periodStart: rangeStart,
              periodEnd: rangeEnd,
              dueDate,
            },
          })
  
          if (dto.assignedToUserId) {
            await tx.taskAssignment.create({
              data: { taskId: task.id, userId: dto.assignedToUserId },
            })
          }
        })
  
        existsSet.add(key)
        created++
      }
    }
  
    return {
      success: true,
      taskMasterId: master.id,
      period: { periodKey, periodStart: rangeStart, periodEnd: rangeEnd },
      results: { created, skippedExisting },
    }
  }
  

  private async generateMonthlyTasks(
    master: any,
    dto: GenerateTasksDto,
    activeClientLinks: any[],
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  ) {
    let year: number
    let month: number
  
    if (dto.financialYear) {
      if (!dto.month)
        throw new BadRequestException('month is required for MONTHLY')
      const fy = this.getFyRange(dto.financialYear)
      month = dto.month
      year = month >= 4 ? fy.fyStartYear : fy.fyEndYear
    } else {
      if (!dto.year || !dto.month)
        throw new BadRequestException('year and month required')
      year = dto.year
      month = dto.month
    }
  
    const { start: periodStart, end: periodEnd } =
      this.monthRangeUTC(year, month)
  
    const periodKey = `${year}-${String(month).padStart(2, '0')}`
  
    let created = 0
    let skippedExisting = 0
  
    for (const link of activeClientLinks) {
      const existing = await this.prisma.task.findFirst({
        where: {
          taskMasterId: master.id,
          clientId: link.clientId,
          periodStart,
        },
      })
  
      if (existing) {
        skippedExisting++
        continue
      }
  
      await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
          data: {
            title: `${master.title} - ${periodKey}`,
            description: master.description ?? null,
            clientId: link.clientId,
            status: 'PENDING',
            taskMasterId: master.id,
            categoryId: master.categoryId,
  
            isBillable: finalIsBillable,
            hsnSac: finalIsBillable ? finalHsnSac : null,
            gstRate: finalIsBillable ? finalGstRate : null,
            unitLabel: finalIsBillable ? finalUnitLabel : null,
  
            periodStart,
            periodEnd,
            dueDate: null,
          },
        })
  
        if (dto.assignedToUserId) {
          await tx.taskAssignment.create({
            data: { taskId: task.id, userId: dto.assignedToUserId },
          })
        }
      })
  
      created++
    }
  
    return {
      success: true,
      taskMasterId: master.id,
      period: { periodKey, periodStart, periodEnd },
      results: { created, skippedExisting },
    }
  }
  
  
  private computeMonthlyDueDate(year: number, month: number, dueDay: number) {
    // Monthly due day in next month
    let y = year
    let m = month + 1
    if (m === 13) { m = 1; y += 1 }
    return this.safeUTCDate(y, m, dueDay)
  }
  

  private async generateQuarterlyTasks(
    master: any,
    dto: GenerateTasksDto,
    activeClientLinks: any[],
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  )
  {
    if (!dto.financialYear) throw new BadRequestException('financialYear is required for QUARTERLY')
    if (!dto.quarter) throw new BadRequestException('quarter is required for QUARTERLY (1..4)')
  
    const fy = this.getFyRange(dto.financialYear)
    const { start: periodStart, end: periodEnd } = this.quarterRangeUTC(fy.fyStartYear, dto.quarter)
    const periodKey = `${dto.financialYear}-Q${dto.quarter}`
  
    const masterStart = new Date(master.startDate)
    const masterEnd = master.endDate ? new Date(master.endDate) : null
  
    const links = activeClientLinks.filter(link => {
      const linkStart = link.startDate ? new Date(link.startDate) : null
      const linkEnd = link.endDate ? new Date(link.endDate) : null
      const clamped = this.clampToMasterAndLinkRange(masterStart, masterEnd, linkStart, linkEnd, periodStart, periodEnd)
      return !!clamped
    })
  
    const existing = await this.prisma.task.findMany({
      where: { taskMasterId: master.id, periodStart, clientId: { in: links.map(l => l.clientId) } },
      select: { clientId: true },
    })
    const existingClientIds = new Set(existing.map(t => t.clientId))
  
    let created = 0
    let skippedExisting = 0
  
    for (const link of links) {
      if (existingClientIds.has(link.clientId)) { skippedExisting++; continue }
  
      await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
          data: {
            title: `${master.title} - ${periodKey}`,
            description: master.description ?? null,
            clientId: link.clientId,
            status: 'PENDING',
            taskMasterId: master.id,
            categoryId: master.categoryId,
            isBillable: finalIsBillable,
            hsnSac: finalIsBillable ? finalHsnSac : null,
            gstRate: finalIsBillable ? finalGstRate : null,
            unitLabel: finalIsBillable ? finalUnitLabel : null,

            periodStart,
            periodEnd,
            dueDate: null, // add due rules later if you want
          },
        })
  
        if (dto.assignedToUserId) {
          await tx.taskAssignment.create({ data: { taskId: task.id, userId: dto.assignedToUserId } })
        }
      })
  
      created++
    }
  
    return {
      success: true,
      taskMasterId: master.id,
      period: { periodKey, periodStart, periodEnd },
      results: { created, skippedExisting },
    }
  }
  

  private async generateYearlyTasks(
    master: any,
    dto: GenerateTasksDto,
    activeClientLinks: any[],
    finalIsBillable: boolean,
    finalHsnSac: string | null,
    finalGstRate: number | null,
    finalUnitLabel: string | null
  ){
    if (!dto.financialYear) throw new BadRequestException('financialYear is required for YEARLY')
  
    const fy = this.getFyRange(dto.financialYear)
    const periodStart = fy.start
    const periodEnd = fy.end
    const periodKey = dto.financialYear
  
    const masterStart = new Date(master.startDate)
    const masterEnd = master.endDate ? new Date(master.endDate) : null
  
    const links = activeClientLinks.filter(link => {
      const linkStart = link.startDate ? new Date(link.startDate) : null
      const linkEnd = link.endDate ? new Date(link.endDate) : null
      const clamped = this.clampToMasterAndLinkRange(masterStart, masterEnd, linkStart, linkEnd, periodStart, periodEnd)
      return !!clamped
    })
  
    const existing = await this.prisma.task.findMany({
      where: { taskMasterId: master.id, periodStart, clientId: { in: links.map(l => l.clientId) } },
      select: { clientId: true },
    })
    const existingClientIds = new Set(existing.map(t => t.clientId))
  
    let created = 0
    let skippedExisting = 0
  
    for (const link of links) {
      if (existingClientIds.has(link.clientId)) { skippedExisting++; continue }
  
      await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
          data: {
            title: `${master.title} - ${periodKey}`,
            description: master.description ?? null,
            clientId: link.clientId,
            status: 'PENDING',
            taskMasterId: master.id,
            categoryId: master.categoryId,
            isBillable: finalIsBillable,
            hsnSac: finalIsBillable ? finalHsnSac : null,
            gstRate: finalIsBillable ? finalGstRate : null,
            unitLabel: finalIsBillable ? finalUnitLabel : null,

            periodStart,
            periodEnd,
            dueDate: null, // Yearly due date logic later
          },
        })
  
        if (dto.assignedToUserId) {
          await tx.taskAssignment.create({ data: { taskId: task.id, userId: dto.assignedToUserId } })
        }
      })
  
      created++
    }
  
    return {
      success: true,
      taskMasterId: master.id,
      period: { periodKey, periodStart, periodEnd },
      results: { created, skippedExisting },
    }
  }
  
  
  
  async generateTasksForPeriod(taskMasterId: number, dto: GenerateTasksDto) {
    const master = await this.prisma.taskMaster.findUnique({
      where: { id: taskMasterId },
      include: { clients: true },
    })
  
    if (!master) throw new NotFoundException('TaskMaster not found')
    if (!master.isActive) throw new BadRequestException('TaskMaster is not active')
    if (!master.clients.length)
      throw new BadRequestException('No clients assigned to this TaskMaster')
  
    // 🔥 BILLING RESOLUTION (OVERRIDE SUPPORT)
    const finalIsBillable =
      dto.isBillable !== undefined
        ? dto.isBillable
        : master.isBillable
  
    const finalHsnSac =
      dto.hsnSac !== undefined
        ? dto.hsnSac
        : master.hsnSac
  
    const finalGstRateRaw =
    dto.gstRate !== undefined
      ? dto.gstRate
      : master.gstRate
  
  const finalGstRate =
    finalGstRateRaw !== null && finalGstRateRaw !== undefined
      ? Number(finalGstRateRaw)
          : null
      
  
    const finalUnitLabel =
      dto.unitLabel !== undefined
        ? dto.unitLabel
        : master.unitLabel
  
    const activeClientLinks = master.clients.filter(l => l.isActive)
  
    if (!activeClientLinks.length) {
      return {
        success: true,
        taskMasterId: master.id,
        results: { created: 0, skippedExisting: 0 },
      }
    }
  
    switch (master.frequency) {
      case FrequencyType.EVENT_BASED:
        return this.generateEventBasedTasks(
          master,
          dto.assignedToUserId,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      case FrequencyType.DAILY:
        return this.generateDailyTasks(
          master,
          dto,
          activeClientLinks,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      case FrequencyType.WEEKLY:
        return this.generateWeeklyTasks(
          master,
          dto,
          activeClientLinks,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      case FrequencyType.MONTHLY:
        return this.generateMonthlyTasks(
          master,
          dto,
          activeClientLinks,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      case FrequencyType.QUARTERLY:
        return this.generateQuarterlyTasks(
          master,
          dto,
          activeClientLinks,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      case FrequencyType.YEARLY:
        return this.generateYearlyTasks(
          master,
          dto,
          activeClientLinks,
          finalIsBillable,
          finalHsnSac,
          finalGstRate,
          finalUnitLabel
        )
  
      default:
        throw new BadRequestException(`${master.frequency} not supported`)
    }
  }
  
  

  private safeUTCDate(year: number, month: number, day: number) {
    // month: 1..12
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const safeDay = Math.min(day, maxDay)
    return new Date(Date.UTC(year, month - 1, safeDay, 0, 0, 0))
  }

  async getGeneratedTasks(taskMasterId: number, filter?: { year?: number; month?: number }) {
    const master = await this.prisma.taskMaster.findUnique({
      where: { id: taskMasterId },
      select: { id: true },
    })
    if (!master) throw new NotFoundException('TaskMaster not found')
  
    let periodStart: Date | undefined
    let periodEnd: Date | undefined
  
    if (filter?.year && filter?.month) {
      const year = filter.year
      const month = filter.month
      periodStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
      periodEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59))
    }
  
    return this.prisma.task.findMany({
      where: {
        taskMasterId,
        ...(periodStart && periodEnd ? { periodStart, periodEnd } : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        client: { select: { id: true, name: true, code: true, gstNumber: true } },
        category: { select: { id: true, name: true } },
  
        // ✅ Option 1 (assignments)
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })
  }
  

  async importFromExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any>(sheet)
  
    let created = 0
    let skipped = 0
    const errors: any[] = []
  
    for (const [index, row] of rows.entries()) {
      try {
        const title = row['Task Title']?.toString().trim()
        const frequencyRaw = row['Frequency']?.toString().trim().toUpperCase()
  
        // Financial Year is OPTIONAL
        const fy = row['Financial Year']
          ? row['Financial Year'].toString().trim()
          : null
  
        // Mandatory fields
        if (!title || !frequencyRaw) {
          skipped++
          continue
        }
  
        // ---------- Frequency ----------
        if (!Object.values(FrequencyType).includes(frequencyRaw)) {
          throw new Error(`Invalid frequency: ${frequencyRaw}`)
        }
        const frequency = frequencyRaw as FrequencyType
  
        // ---------- Category (MANDATORY) ----------
        if (!row['Category']) {
          throw new Error('Category is required')
        }
  
        const categoryName = row['Category'].toString().trim()
        if (!categoryName) {
          throw new Error('Category is required')
        }
  
        const category =
          (await this.prisma.taskCategory.findFirst({
            where: { name: categoryName },
          })) ||
          (await this.prisma.taskCategory.create({
            data: { name: categoryName },
          }))
  
        const categoryId = category.id // ✅ ALWAYS number
  
        // ---------- Dates ----------
        const startDate = row['Start Date']
          ? new Date(row['Start Date'])
          : new Date()
  
        const endDate = row['End Date']
          ? new Date(row['End Date'])
          : null
  
        // ---------- Duplicate check ----------
        // TaskMaster is FY-agnostic
        const exists = await this.prisma.taskMaster.findFirst({
          where: {
            title,
            frequency,
          },
        })
  
        if (exists) {
          skipped++
          continue
        }
  
        // ---------- Create ----------
        await this.prisma.taskMaster.create({
          data: {
            title,
            description: row['Description']?.toString().trim() || null,
  
            categoryId,
            frequency,
            interval: row['Interval'] ? Number(row['Interval']) : null,
  
            // FY optional
            financialYear: fy,
  
            defaultDueDay: row['Default Due Day']
              ? Number(row['Default Due Day'])
              : null,
  
            startDate,
            endDate,
  
            isActive: row['Is Active'] !== 'FALSE',
  
            // Billing
            isBillable: row['Is Billable'] === 'TRUE',
            hsnSac: row['HSN / SAC']?.toString().trim() || null,
            gstRate: row['GST Rate']
              ? Number(row['GST Rate'])
              : null,
            unitLabel: row['Unit']?.toString().trim() || null,
          },
        })
  
        created++
      } catch (err: any) {
        errors.push({
          row: index + 2, // Excel row number (1-based + header)
          error: err?.message || String(err),
        })
      }
    }
  
    return {
      totalRows: rows.length,
      created,
      skipped,
      errors,
    }
  }
  
  
}
