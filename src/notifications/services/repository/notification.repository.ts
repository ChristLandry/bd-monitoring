import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { NotificationEntity } from '../../definitions/model/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  create(data: Partial<NotificationEntity>) {
    return this.repo.create(data);
  }

  save(entity: NotificationEntity) {
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { dateEnvoi: 'DESC' }, take: 200 });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findRecentForMonitoring(monitoringId: string, since: Date) {
    return this.repo.find({
      where: {
        monitoringId,
        dateEnvoi: MoreThan(since),
      },
      order: { dateEnvoi: 'DESC' },
    });
  }

  findPendingEscalation(before: Date) {
    return this.repo
      .createQueryBuilder('n')
      .where('n.acquittee = false')
      .andWhere('n.escalade = false')
      .andWhere('n.date_envoi < :before', { before })
      .getMany();
  }
}
