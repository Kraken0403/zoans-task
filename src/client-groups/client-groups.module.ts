import { Module } from '@nestjs/common'
import { ClientGroupsService } from './client-groups.service'
import { ClientGroupsController } from './client-groups.controller'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [ClientGroupsController],
  providers: [ClientGroupsService, PrismaService],
  exports: [ClientGroupsService],
})
export class ClientGroupsModule {}
