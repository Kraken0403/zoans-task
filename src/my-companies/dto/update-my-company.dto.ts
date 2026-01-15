import { PartialType } from '@nestjs/mapped-types'
import { CreateMyCompanyDto } from './create-my-company.dto'

export class UpdateMyCompanyDto extends PartialType(CreateMyCompanyDto) {}
