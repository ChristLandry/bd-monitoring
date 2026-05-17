import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../definitions/model/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  create(data: Partial<UserEntity>) {
    return this.repo.create(data);
  }

  save(entity: UserEntity) {
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { email: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async remove(entity: UserEntity) {
    await this.repo.remove(entity);
  }
}
