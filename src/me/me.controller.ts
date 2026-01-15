import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private prisma: PrismaService) {}

  /* ===========================
     GET MY TASKS
  =========================== */

  @Get('tasks')
  async myTasks(@Req() req: any) {
    const userId = req.user.id

    return this.prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId,
          },
        },
        OR: [
          { isRecurring: false },          // normal tasks
          { parentTaskId: { not: null } }, // generated tasks
        ],
      },
      orderBy: { dueDate: 'asc' },
      include: {
        client: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })
  }
}
