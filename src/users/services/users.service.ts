import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserRoleDto,
  UserResponseDto,
} from '../definitions/dto/user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const entity = this.repository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
    });
    const saved = await this.repository.save(entity);
    return UserResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map(UserResponseDto.fromEntity);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<UserResponseDto> {
    const entity = await this.getOrFail(id);
    entity.role = dto.role;
    const saved = await this.repository.save(entity);
    return UserResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getOrFail(id);
    await this.repository.remove(entity);
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async getOrFail(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }
    return entity;
  }
}
