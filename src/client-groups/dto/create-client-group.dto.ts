import { IsString } from 'class-validator'

export class CreateClientGroupDto {
  @IsString()
  name: string

  @IsString()
  code: string
}
