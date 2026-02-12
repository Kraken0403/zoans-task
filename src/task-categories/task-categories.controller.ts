import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TaskCategoriesService } from './task-categories.service'
import { CreateTaskCategoryDto } from './dto/create-task-category.dto'
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto'

@ApiTags('Task Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('task-categories')
export class TaskCategoriesController {
  constructor(private readonly service: TaskCategoriesService) {}

  @Post()
  create(@Body() dto: CreateTaskCategoryDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskCategoryDto,
  ) {
    return this.service.update(id, dto)
  }
}
