import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DbType } from '../model/db-type.enum';
import { Environment } from '../model/environment.enum';
import { ConnectionEntity } from '../model/connection.entity';

export class ConnectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: DbType })
  type: DbType;

  @ApiProperty()
  host: string;

  @ApiProperty()
  port: number;

  @ApiProperty()
  database: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Environment })
  environment: Environment;

  @ApiProperty()
  sslEnabled: boolean;

  @ApiPropertyOptional()
  options?: Record<string, unknown> | null;

  @ApiProperty()
  dateCreation: Date;

  static fromEntity(entity: ConnectionEntity): ConnectionResponseDto {
    const dto = new ConnectionResponseDto();
    dto.id = entity.id;
    dto.label = entity.label;
    dto.type = entity.type;
    dto.host = entity.host;
    dto.port = entity.port;
    dto.database = entity.database;
    dto.username = entity.username;
    dto.environment = entity.environment;
    dto.sslEnabled = entity.sslEnabled;
    dto.options = entity.options;
    dto.dateCreation = entity.dateCreation;
    return dto;
  }
}

export class ConnectionTestResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 42 })
  responseTimeMs: number;

  @ApiPropertyOptional({ example: 'PostgreSQL 16.2' })
  serverVersion?: string;

  @ApiPropertyOptional()
  message?: string;
}
