import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('hello')
  async getHello(): Promise<string> {
    return this.analyticsService.getHello();
  }
  @Get('world')
  async getWorld(): Promise<string> {
    return this.analyticsService.getWorld();
  }
}
