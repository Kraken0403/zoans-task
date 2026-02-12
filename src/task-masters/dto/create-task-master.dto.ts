import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
    IsNumber
  } from 'class-validator'
  import { FrequencyType } from '@prisma/client'
  import { ApiProperty } from '@nestjs/swagger'
  
  export class CreateTaskMasterDto {
    @ApiProperty({
      example: 'GST Return',
      description: 'Title of the task master',
    })
    @IsString()
    @IsNotEmpty()
    title: string
  
    @ApiProperty({
      example: 'Monthly GST filing and compliance',
      required: false,
    })
    @IsString()
    @IsOptional()
    description?: string
  
    @ApiProperty({
      example: 1,
      description: 'Task category ID (GST, IT, TDS, etc.)',
    })
    @IsInt()
    categoryId: number
  
    @ApiProperty({
      enum: FrequencyType,
      example: FrequencyType.MONTHLY,
      description: 'How often tasks should be generated',
    })
    @IsEnum(FrequencyType)
    frequency: FrequencyType

    @IsBoolean()
    @ApiProperty({ example: true })
    isBillable: boolean

  
    @ApiProperty({
      example: 1,
      required: false,
      description: 'Interval for frequency (e.g., every 2 months)',
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    interval?: number
  
    @ApiProperty({
      example: '2025-26',
      required: false,
      description: 'Financial year (can be added later)',
    })
    @IsOptional()
    @IsString()
    financialYear?: string
  
    @ApiProperty({
      example: 20,
      required: false,
      description: 'Default due day of the month (1–31)',
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    @Max(31)
    defaultDueDay?: number
  
    @ApiProperty({
      example: '2025-04-01',
      description: 'Start date for task generation (ISO)',
    })
    @IsString()
    @IsNotEmpty()
    startDate: string
  
    @ApiProperty({
      example: '2026-03-31',
      required: false,
      description: 'Optional end date to stop generating tasks',
    })
    @IsString()
    @IsOptional()
    endDate?: string
  
    @ApiProperty({
      example: true,
      required: false,
      description: 'Whether this task master is active',
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
  
    @IsOptional()
    @IsString()
    hsnSac?: string
  
    @IsOptional()
    @IsNumber()
    gstRate?: number
  
    @IsOptional()
    @IsString()
    unitLabel?: string
  }
  