import { IsOptional, IsString } from 'class-validator'

export class UpdateClientGroupDto {
  @IsOptional()
  @IsString()
  name?: string
}
