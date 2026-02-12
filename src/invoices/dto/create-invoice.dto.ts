import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum GstPricingMode {
  EXCLUSIVE = 'EXCLUSIVE',
  INCLUSIVE = 'INCLUSIVE',
}

export class InvoiceItemDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  hsnSac?: string

  @IsOptional()
  @IsInt()
  taskId?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1

  @IsNumber()
  @Type(() => Number)
  unitPrice: number
}

export class CreateInvoiceDto {
  @IsInt()
  clientId: number

  @IsInt()
  fromCompanyId: number

  @IsOptional()
  @IsString()
  placeOfSupply?: string

  @IsOptional()
  @IsEnum(GstPricingMode)
  pricingMode?: GstPricingMode = GstPricingMode.EXCLUSIVE

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstPercent?: number = 18

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount?: number = 0

  @IsOptional()
  @IsBoolean()
  isManualTotal?: boolean = false

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subtotal?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cgstAmount?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sgstAmount?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  igstAmount?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total?: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[]

  @IsOptional()
  @IsString()
  sourceType?: 'MANUAL' | 'TASKS'

}
