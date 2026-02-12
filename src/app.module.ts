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
import { TaskMastersModule } from './task-masters/task-masters.module';
import { TaskCategoriesModule } from './task-categories/task-categories.module';
import { ClientGroupsModule } from './client-groups/client-groups.module';
import { DashboardModule } from './dashboard/dashboard.module'

@Module({
  imports: [ScheduleModule.forRoot(),PrismaModule, DashboardModule, AuthModule, UsersModule, ClientsModule, TasksModule, MeModule, MyCompaniesModule, InvoicesModule, TaskMastersModule, TaskCategoriesModule, ClientGroupsModule ],
  controllers: [AppController, MeController],
  providers: [AppService],
})
export class AppModule {}
