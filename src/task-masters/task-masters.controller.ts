import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TaskMastersService } from './task-masters.service'
import { CreateTaskMasterDto } from './dto/create-task-master.dto'
import { UpdateTaskMasterDto } from './dto/update-task-master.dto'
import { AssignClientsDto } from './dto/assign-clients.dto'
import { GenerateTasksDto } from './dto/generate-tasks.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import * as fs from 'fs'
import * as path from 'path'

@ApiTags('Task Masters')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('task-masters')
export class TaskMastersController {
  constructor(private readonly service: TaskMastersService) {}

  @Post()
  create(@Body() dto: CreateTaskMasterDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAll({
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    })
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskMasterDto,
  ) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.disable(id)
  }

  @Post(':id/clients')
  assignClients(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignClientsDto,
  ) {
    return this.service.assignClients(id, dto)
  }

  @Delete(':id/clients/:clientId')
  unassignClient(
    @Param('id', ParseIntPipe) id: number,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    return this.service.unassignClient(id, clientId)
  }

  @Post(':id/generate')
  generate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GenerateTasksDto,
  ) {
    return this.service.generateTasksForPeriod(id, dto)
  }

  @Get(':id/tasks')
  getGeneratedTasks(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.service.getGeneratedTasks(id, {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    })
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded')

    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

    const filePath = path.join(uploadDir, file.originalname)
    fs.writeFileSync(filePath, file.buffer)

    return this.service.importFromExcel(filePath)
  }
}
