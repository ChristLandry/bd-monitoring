import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpLoggingMiddleware } from './common/middleware/http-logging.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { typeOrmConfigFactory } from './config/typeorm.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConnectionsModule } from './connections/connections.module';
import { QueriesModule } from './queries/queries.module';
import { ContactGroupsModule } from './contact-groups/contact-groups.module';
import { MonitoringsModule } from './monitorings/monitorings.module';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    ConnectionsModule,
    QueriesModule,
    ContactGroupsModule,
    MonitoringsModule,
    LogsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
