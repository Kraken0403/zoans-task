import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { AssignTaskDto } from './dto/assign-task.dto'
import { BulkAssignTaskDto } from './dto/bulk-assign-task.dto'

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  // -------------------- CREATE (Ad-hoc only) --------------------

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.service.create(dto)
  }

  // -------------------- LIST / FILTER --------------------

  @Get()
  findAll(
    @Query('clientId') clientId?: string,
    @Query('assignedToUserId') assignedToUserId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({
      clientId: clientId ? Number(clientId) : undefined,
      assignedToUserId: assignedToUserId ? Number(assignedToUserId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status,
    })
  }

    // ✅ MUST COME BEFORE :id
  @Get('bulk')
  findByIds(@Query('ids') ids: string) {
    if (!ids) return []
    const parsedIds = ids.split(',').map(id => Number(id))
    return this.service.findByIds(parsedIds)
  }

    
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }




  // -------------------- UPDATE --------------------

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.update(id, dto)
  }

  // -------------------- ASSIGNMENT --------------------

  @Patch(':id/assign')
  assign(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: AssignTaskDto,
  ) {
    return this.service.assign(taskId, dto.userId)
  }

  @Post('bulk-assign')
  bulkAssign(@Body() dto: BulkAssignTaskDto) {
    return this.service.bulkAssign(dto.taskIds, dto.userId)
  }


}
