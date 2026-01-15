import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { RecurringTasksService } from './recurring-tasks.service'
import { RecurringTasksController } from './recurring-tasks.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, RecurringTasksController],
  providers: [TasksService, RecurringTasksService],
})
export class TasksModule {}
