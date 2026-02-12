import { IsArray, IsInt } from 'class-validator'

export class BulkAssignTaskDto {
  @IsArray()
  @IsInt({ each: true })
  taskIds: number[]

  @IsInt()
  userId: number
}
