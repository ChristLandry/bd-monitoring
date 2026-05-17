import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionsModule } from '../connections/connections.module';
import { SqlQueryEntity } from './definitions/model/sql-query.entity';
import { SqlQueryVersionEntity } from './definitions/model/sql-query-version.entity';
import { QueriesController } from './controllers/queries.controller';
import { QueriesService } from './services/queries.service';
import { QueryRepository } from './services/repository/query.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SqlQueryEntity, SqlQueryVersionEntity]),
    ConnectionsModule,
  ],
  controllers: [QueriesController],
  providers: [QueriesService, QueryRepository],
  exports: [QueriesService, QueryRepository],
})
export class QueriesModule {}
