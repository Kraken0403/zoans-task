import { IsString, IsOptional, IsEmail, Length, Matches } from 'class-validator'

export class CreateMyCompanyDto {
  @IsString()
  name: string

  @IsString()
  @Length(2, 6)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Code must be uppercase letters or numbers only',
  })
  code: string   // ✅ REQUIRED

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string

  @IsOptional()
  @IsString()
  pan?: string

  @IsOptional()
  @IsString()
  addressLine1?: string

  @IsOptional()
  @IsString()
  addressLine2?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  pincode?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  // Bank
  @IsOptional()
  @IsString()
  bankName?: string

  @IsOptional()
  @IsString()
  bankAccount?: string

  @IsOptional()
  @IsString()
  bankIfsc?: string

  @IsOptional()
  @IsString()
  bankBranch?: string
}
