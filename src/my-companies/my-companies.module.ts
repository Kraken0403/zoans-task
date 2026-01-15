import { Module } from '@nestjs/common'
import { MyCompaniesController } from './my-companies.controller'
import { MyCompaniesService } from './my-companies.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [MyCompaniesController],
  providers: [MyCompaniesService],
})
export class MyCompaniesModule {}
