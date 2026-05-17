import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SqlQueryEntity } from '../model/sql-query.entity';
import { SqlQueryVersionEntity } from '../model/sql-query-version.entity';

export class QueryVersionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  corpsRequete: string;

  @ApiProperty()
  parametresDynamiques: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(v: SqlQueryVersionEntity): QueryVersionDto {
    const dto = new QueryVersionDto();
    dto.id = v.id;
    dto.version = v.version;
    dto.corpsRequete = v.corpsRequete;
    dto.parametresDynamiques = v.parametresDynamiques;
    dto.createdAt = v.createdAt;
    return dto;
  }
}

export class QueryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  corpsRequete: string;

  @ApiProperty()
  parametresDynamiques: Record<string, unknown>;

  @ApiProperty()
  connectionId: string;

  @ApiProperty()
  timeoutMax: number;

  @ApiProperty()
  version: number;

  @ApiProperty()
  dateDerniereModif: Date;

  @ApiPropertyOptional({ type: [QueryVersionDto] })
  versions?: QueryVersionDto[];

  static fromEntity(
    entity: SqlQueryEntity,
    versions?: SqlQueryVersionEntity[],
  ): QueryResponseDto {
    const dto = new QueryResponseDto();
    dto.id = entity.id;
    dto.label = entity.label;
    dto.corpsRequete = entity.corpsRequete;
    dto.parametresDynamiques = entity.parametresDynamiques;
    dto.connectionId = entity.connectionId;
    dto.timeoutMax = entity.timeoutMax;
    dto.version = entity.version;
    dto.dateDerniereModif = entity.dateDerniereModif;
    if (versions) {
      dto.versions = versions.map(QueryVersionDto.fromEntity);
    }
    return dto;
  }
}
