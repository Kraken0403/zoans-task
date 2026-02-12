import { Module } from '@nestjs/common'
import { TaskMastersController } from './task-masters.controller'
import { TaskMastersService } from './task-masters.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [TaskMastersController],
  providers: [TaskMastersService, PrismaService],
  exports: [TaskMastersService],
})
export class TaskMastersModule {}
