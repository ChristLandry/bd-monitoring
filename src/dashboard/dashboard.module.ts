import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { MonitoringsModule } from '../monitorings/monitorings.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [MonitoringsModule, LogsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
