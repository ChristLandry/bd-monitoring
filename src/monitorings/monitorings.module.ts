import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringEntity } from './definitions/model/monitoring.entity';
import { MonitoringsController } from './controllers/monitorings.controller';
import { MonitoringsService } from './services/monitorings.service';
import { MonitoringRepository } from './services/repository/monitoring.repository';
import { MonitoringExecutionService } from './services/monitoring-execution.service';
import { MonitoringSchedulerService } from './services/monitoring-scheduler.service';
import { QueriesModule } from '../queries/queries.module';
import { ConnectionsModule } from '../connections/connections.module';
import { LogsModule } from '../logs/logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContactGroupsModule } from '../contact-groups/contact-groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonitoringEntity]),
    QueriesModule,
    ConnectionsModule,
    LogsModule,
    NotificationsModule,
    ContactGroupsModule,
  ],
  controllers: [MonitoringsController],
  providers: [
    MonitoringsService,
    MonitoringRepository,
    MonitoringExecutionService,
    MonitoringSchedulerService,
  ],
  exports: [MonitoringsService, MonitoringRepository],
})
export class MonitoringsModule {}
