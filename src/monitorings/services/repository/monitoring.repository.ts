import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringEntity } from '../../definitions/model/monitoring.entity';
import { MonitoringStatus } from '../../definitions/model/monitoring-status.enum';
import { Priority } from '../../definitions/model/priority.enum';

@Injectable()
export class MonitoringRepository {
  constructor(
    @InjectRepository(MonitoringEntity)
    private readonly repo: Repository<MonitoringEntity>,
  ) {}

  create(data: Partial<MonitoringEntity>) {
    return this.repo.create(data);
  }

  save(entity: MonitoringEntity) {
    return this.repo.save(entity);
  }

  findById(id: string, relations = false) {
    return this.repo.findOne({
      where: { id },
      relations: relations ? ['query', 'query.connection'] : undefined,
    });
  }

  findAll(filters?: {
    statut?: MonitoringStatus;
    priorite?: Priority;
    contactGroupId?: string;
  }) {
    const qb = this.repo.createQueryBuilder('m');
    if (filters?.statut) {
      qb.andWhere('m.statut = :statut', { statut: filters.statut });
    }
    if (filters?.priorite) {
      qb.andWhere('m.priorite = :priorite', { priorite: filters.priorite });
    }
    if (filters?.contactGroupId) {
      qb.andWhere('m.contact_group_id = :contactGroupId', {
        contactGroupId: filters.contactGroupId,
      });
    }
    return qb.orderBy('m.date_creation', 'DESC').getMany();
  }

  findActive() {
    return this.repo.find({
      where: { statut: MonitoringStatus.ACTIF },
      relations: ['query', 'query.connection'],
    });
  }

  countByStatus(statut: MonitoringStatus) {
    return this.repo.count({ where: { statut } });
  }

  async remove(entity: MonitoringEntity) {
    await this.repo.remove(entity);
  }
}
