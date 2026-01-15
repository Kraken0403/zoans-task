import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { TasksModule } from './tasks/tasks.module';
import { MeController } from './me/me.controller';
import { MeModule } from './me/me.module';
import { ScheduleModule } from '@nestjs/schedule'
import { MyCompaniesModule } from './my-companies/my-companies.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [ScheduleModule.forRoot(),PrismaModule, AuthModule, UsersModule, ClientsModule, TasksModule, MeModule, MyCompaniesModule, InvoicesModule],
  controllers: [AppController, MeController],
  providers: [AppService],
})
export class AppModule {}
