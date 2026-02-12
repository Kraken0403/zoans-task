import { IsInt, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  clientId: number

  @IsInt()
  @IsOptional()
  categoryId?: number

  @IsString()
  @IsOptional()
  dueDate?: string // ISO

  @IsInt()
  @IsOptional()
  assignedToUserId?: number
}
