import {
    IsString,
    IsOptional,
    IsInt,
    IsNumber,
    Min,
  } from 'class-validator'
  import { Type } from 'class-transformer'
  
  export class AddInvoiceItemDto {
    @IsString()
    title: string
  
    @IsOptional()
    @IsString()
    description?: string
  
    @IsOptional()
    @IsInt()
    taskId?: number
  
    @IsOptional()
    @IsString()
    hsnSac?: string
  
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1
  
    @IsNumber()
    @Type(() => Number)
    unitPrice: number
  }
  