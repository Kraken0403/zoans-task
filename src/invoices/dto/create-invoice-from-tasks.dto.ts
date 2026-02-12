import {
  IsArray,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { GstPricingMode } from './create-invoice.dto'

export class CreateInvoiceFromTasksDto {
  @IsInt()
  clientId: number

  @IsInt()
  fromCompanyId: number

  @IsArray()
  @IsInt({ each: true })
  taskIds: number[]

  // ✅ ADD THIS (CRITICAL)
  @IsObject()
  taskPriceMap: Record<number, number>
  // Example: { "12": 5000, "15": 12000 }

  @IsOptional()
  @IsEnum(GstPricingMode)
  pricingMode?: GstPricingMode = GstPricingMode.EXCLUSIVE

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstPercent?: number = 18

  @IsOptional()
  @IsBoolean()
  isIntraState?: boolean = true

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount?: number = 0

  @IsOptional()
  @IsBoolean()
  isManualTotal?: boolean = false

  @IsOptional()
  @IsNumber()
  subtotal?: number

  @IsOptional()
  @IsNumber()
  cgstAmount?: number

  @IsOptional()
  @IsNumber()
  sgstAmount?: number

  @IsOptional()
  @IsNumber()
  igstAmount?: number

  @IsOptional()
  @IsNumber()
  total?: number

  @IsOptional()
  @IsString()
  notes?: string
}
