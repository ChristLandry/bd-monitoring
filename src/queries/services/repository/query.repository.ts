import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SqlQueryEntity } from '../../definitions/model/sql-query.entity';
import { SqlQueryVersionEntity } from '../../definitions/model/sql-query-version.entity';

@Injectable()
export class QueryRepository {
  constructor(
    @InjectRepository(SqlQueryEntity)
    private readonly queryRepo: Repository<SqlQueryEntity>,
    @InjectRepository(SqlQueryVersionEntity)
    private readonly versionRepo: Repository<SqlQueryVersionEntity>,
  ) {}

  create(data: Partial<SqlQueryEntity>): SqlQueryEntity {
    return this.queryRepo.create(data);
  }

  save(entity: SqlQueryEntity): Promise<SqlQueryEntity> {
    return this.queryRepo.save(entity);
  }

  saveVersion(entity: SqlQueryVersionEntity): Promise<SqlQueryVersionEntity> {
    return this.versionRepo.save(entity);
  }

  findAll(filters: {
    connectionId?: string;
    version?: number;
    skip: number;
    take: number;
  }): Promise<[SqlQueryEntity[], number]> {
    const qb = this.queryRepo.createQueryBuilder('q');
    if (filters.connectionId) {
      qb.andWhere('q.connection_id = :connectionId', {
        connectionId: filters.connectionId,
      });
    }
    if (filters.version !== undefined) {
      qb.andWhere('q.version = :version', { version: filters.version });
    }
    return qb
      .orderBy('q.date_derniere_modif', 'DESC')
      .skip(filters.skip)
      .take(filters.take)
      .getManyAndCount();
  }

  findById(id: string): Promise<SqlQueryEntity | null> {
    return this.queryRepo.findOne({ where: { id } });
  }

  findVersions(queryId: string): Promise<SqlQueryVersionEntity[]> {
    return this.versionRepo.find({
      where: { queryId },
      order: { version: 'DESC' },
    });
  }

  countMonitoringsUsingQuery(_queryId: string): Promise<number> {
    return Promise.resolve(0);
  }

  async remove(entity: SqlQueryEntity): Promise<void> {
    await this.queryRepo.remove(entity);
  }

  createVersion(
    data: Partial<SqlQueryVersionEntity>,
  ): SqlQueryVersionEntity {
    return this.versionRepo.create(data);
  }
}
