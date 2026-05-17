import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateContactGroupDto,
  ContactGroupResponseDto,
  UpdateContactGroupDto,
} from '../definitions/dto/contact-group.dto';
import { ContactGroupRepository } from './repository/contact-group.repository';

@Injectable()
export class ContactGroupsService {
  constructor(private readonly repository: ContactGroupRepository) {}

  async create(dto: CreateContactGroupDto): Promise<ContactGroupResponseDto> {
    const entity = this.repository.create({
      label: dto.label,
      description: dto.description ?? null,
      members: dto.members,
      plagesHoraires: dto.plagesHoraires ?? [],
      remplacants: dto.remplacants ?? [],
    });
    const saved = await this.repository.save(entity);
    return ContactGroupResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<ContactGroupResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map(ContactGroupResponseDto.fromEntity);
  }

  async update(
    id: string,
    dto: UpdateContactGroupDto,
  ): Promise<ContactGroupResponseDto> {
    const entity = await this.getOrFail(id);
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    return ContactGroupResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getOrFail(id);
    await this.repository.remove(entity);
  }

  async getOrFail(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Groupe de contacts ${id} introuvable`);
    }
    return entity;
  }
}
