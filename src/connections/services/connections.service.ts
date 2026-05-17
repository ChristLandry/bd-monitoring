import { Injectable, NotFoundException } from '@nestjs/common';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateConnectionDto } from '../definitions/dto/create-connection.dto';
import { UpdateConnectionDto } from '../definitions/dto/update-connection.dto';
import { ConnectionEntity } from '../definitions/model/connection.entity';
import { ConnectionRepository } from './repository/connection.repository';
import { QueryExecutionService } from './query-execution.service';
import {
  ConnectionResponseDto,
  ConnectionTestResponseDto,
} from '../definitions/dto/connection-response.dto';

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly repository: ConnectionRepository,
    private readonly encryption: EncryptionService,
    private readonly queryExecution: QueryExecutionService,
  ) {}

  async create(dto: CreateConnectionDto): Promise<ConnectionResponseDto> {
    const entity = this.repository.create({
      label: dto.label,
      type: dto.type,
      host: dto.host,
      port: dto.port,
      database: dto.database,
      username: dto.username,
      passwordEncrypted: this.encryption.encrypt(dto.password),
      environment: dto.environment,
      sslEnabled: dto.sslEnabled ?? false,
      options: dto.options ?? null,
    });
    const saved = await this.repository.save(entity);
    return ConnectionResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<ConnectionResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map(ConnectionResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<ConnectionResponseDto> {
    const entity = await this.getOrFail(id);
    return ConnectionResponseDto.fromEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateConnectionDto & { password?: string },
  ): Promise<ConnectionResponseDto> {
    const entity = await this.getOrFail(id);
    Object.assign(entity, {
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.host !== undefined && { host: dto.host }),
      ...(dto.port !== undefined && { port: dto.port }),
      ...(dto.database !== undefined && { database: dto.database }),
      ...(dto.username !== undefined && { username: dto.username }),
      ...(dto.environment !== undefined && { environment: dto.environment }),
      ...(dto.sslEnabled !== undefined && { sslEnabled: dto.sslEnabled }),
      ...(dto.options !== undefined && { options: dto.options }),
    });
    if (dto.password) {
      entity.passwordEncrypted = this.encryption.encrypt(dto.password);
    }
    const saved = await this.repository.save(entity);
    return ConnectionResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getOrFail(id);
    await this.repository.remove(entity);
  }

  async test(id: string): Promise<ConnectionTestResponseDto> {
    const entity = await this.getOrFail(id);
    return this.queryExecution.testConnection(entity);
  }

  async getEntityOrFail(id: string): Promise<ConnectionEntity> {
    return this.getOrFail(id);
  }

  private async getOrFail(id: string): Promise<ConnectionEntity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Connexion ${id} introuvable`);
    }
    return entity;
  }
}
