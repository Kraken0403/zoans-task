import { Controller, Post } from '@nestjs/common'
import { RecurringTasksService } from './recurring-tasks.service'

@Controller('tasks/recurring')
export class RecurringTasksController {
  constructor(private readonly recurring: RecurringTasksService) {}

  // ⚠️ ADMIN / DEBUG ONLY
  @Post('run')
  runNow() {
    return this.recurring.handleRecurringTasks()
  }
}
