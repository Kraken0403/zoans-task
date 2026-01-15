import { IsString, IsOptional, IsEmail, Length } from 'class-validator'

export class CreateMyCompanyDto {
  @IsString()
  name: string

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

  @IsOptional()
  @IsString()
  logoUrl?: string

  // Bank details
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

  @IsOptional()
  @IsString()
  sealUrl?: string

  @IsOptional()
  @IsString()
  signatureUrl?: string

}
