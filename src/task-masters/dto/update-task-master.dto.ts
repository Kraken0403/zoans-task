import { PartialType } from '@nestjs/swagger'
import { CreateTaskMasterDto } from './create-task-master.dto'

export class UpdateTaskMasterDto extends PartialType(CreateTaskMasterDto) {}
