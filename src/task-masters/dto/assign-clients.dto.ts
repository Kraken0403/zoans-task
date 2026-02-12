import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class AssignClientsDto {
  @IsArray()
  @IsInt({ each: true })
  clientIds: number[]

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(31)
  customDueDay?: number

  @IsString()
  @IsOptional()
  startDate?: string // ISO

  @IsString()
  @IsOptional()
  endDate?: string // ISO

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
