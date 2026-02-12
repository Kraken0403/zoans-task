import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@Controller('me')
@UseGuards(JwtAuthGuard)
@ApiTags('Tasks')
@ApiBearerAuth('access-token')
export class MeController {
  constructor(private prisma: PrismaService) {}

  /* ===========================
     GET MY TASKS
  =========================== */
  @Get('tasks')
  async myTasks(@Req() req) {
    const userId = req.user.id
  
    return this.prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        client: true,
        category: true,
        taskMaster: {
          select: {
            id: true,
            title: true,
          },
        },
        assignments: {
          include: {
            user: true,
          },
        },
      },
    })
  }
  
  
}
