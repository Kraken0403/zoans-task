import { Module } from '@nestjs/common'
import { TaskCategoriesController } from './task-categories.controller'
import { TaskCategoriesService } from './task-categories.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [TaskCategoriesController],
  providers: [TaskCategoriesService, PrismaService],
  exports: [TaskCategoriesService],
})
export class TaskCategoriesModule {}
