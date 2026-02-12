// dto/generate-tasks.dto.ts
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator'

export class GenerateTasksDto {
  @IsOptional()
  @IsString()
  financialYear?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number

  // backward compatibility only (MONTHLY without FY)
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number

  @IsOptional()
  @IsInt()
  assignedToUserId?: number
}
