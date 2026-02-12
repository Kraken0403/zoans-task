import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTaskCategoryDto {
  @ApiProperty({ example: 'GST Compliance', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
