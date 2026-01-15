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

  
  
  class InvoiceItemDto {
    @IsString()
    title: string
  
    @IsOptional()
    @IsString()
    description?: string
  
    @IsOptional()
    @IsString()
    hsnSac?: string   // ✅ FIX 1 (THIS WAS CAUSING 400)
  
    @IsOptional()
    @IsInt()
    taskId?: number
  
    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1
  
    @IsNumber()
    @Type(() => Number)   // ✅ FIX 2 (important)
    unitPrice: number
  }
  
  export class CreateInvoiceDto {
    @IsInt()
    clientId: number
  
    @IsInt()
    fromCompanyId: number
  
    @IsOptional()
    @IsString()
    placeOfSupply?: string // ✅ ADD THIS
  
    @IsOptional()
    @IsEnum(GstPricingMode)
    pricingMode?: GstPricingMode = GstPricingMode.EXCLUSIVE
  
    @IsOptional()
    @IsNumber()
    gstPercent?: number = 18
  
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
  
    @IsOptional()
    @IsString()
    notes?: string
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[]
  }
  