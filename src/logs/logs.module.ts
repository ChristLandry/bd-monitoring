import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionLogEntity } from './definitions/model/execution-log.entity';
import { LogsController } from './controllers/logs.controller';
import { LogsService } from './services/logs.service';
import { LogRepository } from './services/repository/log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionLogEntity])],
  controllers: [LogsController],
  providers: [LogsService, LogRepository],
  exports: [LogsService, LogRepository],
})
export class LogsModule {}
