import { IsEmail, IsOptional, IsString } from 'class-validator'

export class SendInvoiceDto {
  @IsEmail()
  toEmail: string

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  message?: string
}
