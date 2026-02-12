import { IsString } from 'class-validator'

export class LoginDto {
  @IsString()
  identifier: string   // email OR username

  @IsString()
  password: string
}
