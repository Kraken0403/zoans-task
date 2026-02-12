import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsInt,
} from 'class-validator'
import { TaskStatus } from '@prisma/client'

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsDateString()
  dueDate?: string | null

  // ✅ NEW
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userIds?: number[]
}
