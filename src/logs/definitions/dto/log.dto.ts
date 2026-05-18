import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/definitions/dto/pagination-query.dto';
import { ExecutionStatus } from '../model/execution-status.enum';
import { ExecutionLogEntity } from '../model/execution-log.entity';
import { NotificationChannel } from '../../../monitorings/definitions/model/notification-channel.enum';

export class LogFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  monitoringId?: string;

  @ApiPropertyOptional({ enum: ExecutionStatus })
  @IsOptional()
  @IsEnum(ExecutionStatus)
  statut?: ExecutionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class LogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idMonitoring: string;

  @ApiProperty()
  dateExecution: Date;

  @ApiPropertyOptional()
  valeurRetournee?: number | null;

  @ApiProperty()
  seuilDepasse: boolean;

  @ApiProperty({ enum: ExecutionStatus })
  statutExecution: ExecutionStatus;

  @ApiProperty()
  dureeMs: number;

  @ApiPropertyOptional()
  messageErreur?: string | null;

  @ApiProperty()
  notificationEnvoyee: boolean;

  @ApiPropertyOptional({ enum: NotificationChannel })
  canalUtilise?: NotificationChannel | null;

  static fromEntity(e: ExecutionLogEntity): LogResponseDto {
    const dto = new LogResponseDto();
    Object.assign(dto, e);
    return dto;
  }
}

export class TrendPointDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  value: number;
}

export class TrendResponseDto {
  @ApiProperty({ type: [TrendPointDto] })
  series: TrendPointDto[];

  @ApiProperty({ description: 'Dérive détectée (%/heure)' })
  driftPercentPerHour: number;

  @ApiProperty()
  predictiveFlag: boolean;
}

export class ExportFormatQuery {
  @ApiPropertyOptional({ enum: ['csv', 'pdf'], default: 'csv' })
  format?: 'csv' | 'pdf' = 'csv';
}
