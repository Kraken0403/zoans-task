import {
    IsString,
    IsInt,
    IsOptional,
    IsArray,
    IsDateString,
    IsBoolean,
    IsEnum,
  } from 'class-validator'
  import { FrequencyType } from '@prisma/client'
  
  export class CreateTaskDto {
    @IsString()
    title: string
  
    @IsOptional()
    @IsString()
    description?: string
  
    @IsInt()
    clientId: number
  
    // one-time
    @IsOptional()
    @IsDateString()
    dueDate?: string
  
    // recurring
    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean
  
    @IsOptional()
    @IsEnum(FrequencyType)
    frequency?: FrequencyType
  
    @IsOptional()
    @IsInt()
    interval?: number
  
    @IsOptional()
    @IsDateString()
    startDate?: string
  
    @IsOptional()
    @IsDateString()
    endDate?: string // ✅
  
    @IsOptional()
    @IsBoolean()
    skipWeekends?: boolean // ✅
  
    @IsOptional()
    @IsBoolean()
    isPaused?: boolean // ✅
  
    // assignments
    @IsOptional()
    @IsArray()
    userIds?: number[]
  }
  