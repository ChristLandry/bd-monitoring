import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConnectionsService } from '../../connections/services/connections.service';
import { paginate, PaginatedResult } from '../../common/definitions/dto/pagination-query.dto';
import { CreateQueryDto } from '../definitions/dto/create-query.dto';
import { UpdateQueryDto } from '../definitions/dto/update-query.dto';
import { QueryFilterDto } from '../definitions/dto/query-filter.dto';
import { QueryResponseDto } from '../definitions/dto/query-response.dto';
import { QueryRepository } from './repository/query.repository';

@Injectable()
export class QueriesService {
  constructor(
    private readonly repository: QueryRepository,
    private readonly connectionsService: ConnectionsService,
  ) {}

  async create(dto: CreateQueryDto): Promise<QueryResponseDto> {
    await this.connectionsService.getEntityOrFail(dto.connectionId);
    const entity = this.repository.create({
      label: dto.label,
      corpsRequete: dto.corpsRequete,
      parametresDynamiques: dto.parametresDynamiques ?? {},
      connectionId: dto.connectionId,
      timeoutMax: dto.timeoutMax ?? 30,
      version: 1,
    });
    const saved = await this.repository.save(entity);
    await this.repository.saveVersion(
      this.repository.createVersion({
        queryId: saved.id,
        version: 1,
        corpsRequete: saved.corpsRequete,
        parametresDynamiques: saved.parametresDynamiques,
      }),
    );
    return QueryResponseDto.fromEntity(saved);
  }

  async findAll(
    filters: QueryFilterDto,
  ): Promise<PaginatedResult<QueryResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const [items, total] = await this.repository.findAll({
      connectionId: filters.connectionId,
      version: filters.version,
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(
      items.map((e) => QueryResponseDto.fromEntity(e)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<QueryResponseDto> {
    const entity = await this.getOrFail(id);
    const versions = await this.repository.findVersions(id);
    return QueryResponseDto.fromEntity(entity, versions);
  }

  async update(id: string, dto: UpdateQueryDto): Promise<QueryResponseDto> {
    const entity = await this.getOrFail(id);
    if (dto.connectionId) {
      await this.connectionsService.getEntityOrFail(dto.connectionId);
    }
    const changed =
      dto.corpsRequete !== undefined ||
      dto.parametresDynamiques !== undefined ||
      dto.label !== undefined;

    if (dto.label !== undefined) entity.label = dto.label;
    if (dto.corpsRequete !== undefined) entity.corpsRequete = dto.corpsRequete;
    if (dto.parametresDynamiques !== undefined) {
      entity.parametresDynamiques = dto.parametresDynamiques;
    }
    if (dto.connectionId !== undefined) entity.connectionId = dto.connectionId;
    if (dto.timeoutMax !== undefined) entity.timeoutMax = dto.timeoutMax;

    if (changed) {
      entity.version += 1;
      await this.repository.saveVersion(
        this.repository.createVersion({
          queryId: entity.id,
          version: entity.version,
          corpsRequete: entity.corpsRequete,
          parametresDynamiques: entity.parametresDynamiques,
        }),
      );
    }
    const saved = await this.repository.save(entity);
    return QueryResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getOrFail(id);
    const usage = await this.repository.countMonitoringsUsingQuery(id);
    if (usage > 0) {
      throw new ConflictException(
        'Impossible de supprimer une requête utilisée par des monitorings',
      );
    }
    await this.repository.remove(entity);
  }

  async getEntityOrFail(id: string) {
    return this.getOrFail(id);
  }

  private async getOrFail(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Requête ${id} introuvable`);
    }
    return entity;
  }
}
