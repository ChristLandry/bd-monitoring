import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactGroupEntity } from '../../definitions/model/contact-group.entity';

@Injectable()
export class ContactGroupRepository {
  constructor(
    @InjectRepository(ContactGroupEntity)
    private readonly repo: Repository<ContactGroupEntity>,
  ) {}

  create(data: Partial<ContactGroupEntity>) {
    return this.repo.create(data);
  }

  save(entity: ContactGroupEntity) {
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { label: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async remove(entity: ContactGroupEntity) {
    await this.repo.remove(entity);
  }
}
