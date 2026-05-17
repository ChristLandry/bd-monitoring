import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionEntity } from './definitions/model/connection.entity';
import { ConnectionsController } from './controllers/connections.controller';
import { ConnectionsService } from './services/connections.service';
import { ConnectionRepository } from './services/repository/connection.repository';
import { QueryExecutionService } from './services/query-execution.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectionEntity])],
  controllers: [ConnectionsController],
  providers: [
    ConnectionsService,
    ConnectionRepository,
    QueryExecutionService,
  ],
  exports: [ConnectionsService, QueryExecutionService, ConnectionRepository],
})
export class ConnectionsModule {}
