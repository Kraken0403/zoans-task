import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
  } from '@nestjs/common'
  import { TasksService } from './tasks.service'
  import { CreateTaskDto } from './dto/create-task.dto'
  import { UpdateTaskDto } from './dto/update-task.dto'
  
  @Controller('tasks')
  export class TasksController {
    constructor(private readonly tasks: TasksService) {}
  
    /* ===========================
       CREATE
    =========================== */
  
    @Post()
    create(@Body() dto: CreateTaskDto) {
      return this.tasks.create(dto)
    }
  
    /* ===========================
       READ
    =========================== */
  
    // All visible tasks (normal + generated)
    @Get()
    findAll() {
      return this.tasks.findAll()
    }
  
    // Single task (instance or template)
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.tasks.findOne(+id)
    }
  
    /* ===========================
       UPDATE
    =========================== */
  
    // Generic update (used for normal tasks + template edits)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
      return this.tasks.update(+id, dto)
    }
  
    /* ===========================
       RECURRENCE CONTROL
       (explicit, safe endpoints)
    =========================== */
  
    // Pause recurring template
    @Patch(':id/pause')
    pause(@Param('id') id: string) {
      return this.tasks.update(+id, { isPaused: true })
    }
  
    // Resume recurring template
    @Patch(':id/resume')
    resume(@Param('id') id: string) {
      return this.tasks.update(+id, { isPaused: false })
    }
  
    // Regenerate future tasks from template
    @Post(':id/regenerate')
    regenerate(@Param('id') id: string) {
      // calls update logic internally
      return this.tasks.update(+id, {})
    }
  
    /* ===========================
       DELETE
    =========================== */
  
    // Template → soft delete
    // Instance / normal task → hard delete
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.tasks.remove(+id)
    }
  }
  