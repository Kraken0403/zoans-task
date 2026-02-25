import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GenerateTasksDto {
  @IsOptional()
  @IsString()
  financialYear?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  /* 🔥 NEW BILLING OVERRIDE FIELDS */

  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @IsOptional()
  @IsString()
  hsnSac?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  gstRate?: number;

  @IsOptional()
  @IsString()
  unitLabel?: string;
}
