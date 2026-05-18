import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionLogEntity } from '../../definitions/model/execution-log.entity';
import { ExecutionStatus } from '../../definitions/model/execution-status.enum';

@Injectable()
export class LogRepository {
  constructor(
    @InjectRepository(ExecutionLogEntity)
    private readonly repo: Repository<ExecutionLogEntity>,
  ) {}

  create(data: Partial<ExecutionLogEntity>) {
    return this.repo.create(data);
  }

  save(entity: ExecutionLogEntity) {
    return this.repo.save(entity);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findAll(filters: {
    monitoringId?: string;
    statut?: ExecutionStatus;
    dateFrom?: Date;
    dateTo?: Date;
    skip: number;
    take: number;
  }): Promise<[ExecutionLogEntity[], number]> {
    const qb = this.repo.createQueryBuilder('l');
    if (filters.monitoringId) {
      qb.andWhere('l.id_monitoring = :monitoringId', {
        monitoringId: filters.monitoringId,
      });
    }
    if (filters.statut) {
      qb.andWhere('l.statut_execution = :statut', { statut: filters.statut });
    }
    if (filters.dateFrom) {
      qb.andWhere('l.date_execution >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters.dateTo) {
      qb.andWhere('l.date_execution <= :dateTo', { dateTo: filters.dateTo });
    }
    return qb
      .orderBy('l.date_execution', 'DESC')
      .skip(filters.skip)
      .take(filters.take)
      .getManyAndCount();
  }

  findByMonitoring(monitoringId: string, limit = 100) {
    return this.repo.find({
      where: { idMonitoring: monitoringId },
      order: { dateExecution: 'DESC' },
      take: limit,
    });
  }

  findTrendData(monitoringId: string, since: Date) {
    return this.repo
      .createQueryBuilder('l')
      .where('l.id_monitoring = :monitoringId', { monitoringId })
      .andWhere('l.date_execution >= :since', { since })
      .andWhere('l.valeur_retournee IS NOT NULL')
      .orderBy('l.date_execution', 'ASC')
      .getMany();
  }
}
