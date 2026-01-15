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
import { GstPricingMode } from './create-invoice.dto'

export class CreateInvoiceFromTasksDto {
  @IsInt()
  clientId: number

  @IsInt()
  fromCompanyId: number

  @IsArray()
  taskIds: number[]

  /**
   * Example:
   * {
   *   "12": 5000,
   *   "15": 12000
   * }
   */
  @IsOptional()
  @IsObject()
  taskPriceMap?: Record<number, number>

  @IsOptional()
  @IsEnum(GstPricingMode)
  pricingMode?: GstPricingMode = GstPricingMode.EXCLUSIVE

  @IsOptional()
  @IsNumber()
  gstPercent?: number = 18

  @IsOptional()
  @IsBoolean()
  isIntraState?: boolean = true

  @IsOptional()
  @IsNumber()
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

  /**
   * Used as invoice footer / declaration / special instruction
   */
  @IsOptional()
  @IsString()
  notes?: string
}
