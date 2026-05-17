import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionEntity } from '../../definitions/model/connection.entity';

@Injectable()
export class ConnectionRepository {
  constructor(
    @InjectRepository(ConnectionEntity)
    private readonly repo: Repository<ConnectionEntity>,
  ) {}

  create(data: Partial<ConnectionEntity>): ConnectionEntity {
    return this.repo.create(data);
  }

  save(entity: ConnectionEntity): Promise<ConnectionEntity> {
    return this.repo.save(entity);
  }

  findAll(): Promise<ConnectionEntity[]> {
    return this.repo.find({ order: { dateCreation: 'DESC' } });
  }

  findById(id: string): Promise<ConnectionEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async remove(entity: ConnectionEntity): Promise<void> {
    await this.repo.remove(entity);
  }
}
