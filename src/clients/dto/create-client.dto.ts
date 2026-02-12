import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt
} from 'class-validator'

export class CreateClientDto {
  @IsString()
  code: string   // ✅ REQUIRED (client code)

  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  // 🔥 Structured Address (matches Prisma model)

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

  // GST
  @IsOptional()
  @IsString()
  gstNumber?: string

  @IsOptional()
  @IsInt()
  clientGroupId?: number

}
