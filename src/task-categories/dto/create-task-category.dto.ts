import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskCategoryDto {
  @ApiProperty({ example: 'GST' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'GST Compliance & Returns', required: false })
  @IsString()
  @IsOptional()
  description?: string
}
