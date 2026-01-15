import {
    IsString,
    IsInt,
    IsOptional,
    IsArray,
    IsDateString,
    IsBoolean,
    IsEnum,
  } from 'class-validator'
  import { FrequencyType, TaskStatus } from '@prisma/client'
  
  export class UpdateTaskDto {
    @IsOptional() @IsString()
    title?: string
  
    @IsOptional() @IsString()
    description?: string
  
    @IsOptional() @IsDateString()
    dueDate?: string
  
    @IsOptional() @IsEnum(TaskStatus)
    status?: TaskStatus
  
    @IsOptional() @IsArray()
    userIds?: number[]
  
    // ✅ allow updating template recurrence config
    @IsOptional() @IsBoolean()
    isRecurring?: boolean
  
    @IsOptional() @IsEnum(FrequencyType)
    frequency?: FrequencyType
  
    @IsOptional() @IsInt()
    interval?: number
  
    @IsOptional() @IsDateString()
    startDate?: string
  
    @IsOptional() @IsDateString()
    endDate?: string
  
    @IsOptional() @IsBoolean()
    skipWeekends?: boolean
  
    @IsOptional() @IsBoolean()
    isPaused?: boolean
  }
  