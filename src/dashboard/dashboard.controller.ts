// src/dashboard/dashboard.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { DashboardService } from './dashboard.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Req() req) {
    return this.dashboardService.getSummary(req.user.id)
  }
}
