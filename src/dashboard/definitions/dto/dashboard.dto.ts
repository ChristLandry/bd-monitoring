import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MonitoringStatus } from '../../../monitorings/definitions/model/monitoring-status.enum';
import { Priority } from '../../../monitorings/definitions/model/priority.enum';

export class DashboardFilterDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  connectionId?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priorite?: Priority;

  @ApiPropertyOptional({ enum: MonitoringStatus })
  @IsOptional()
  @IsEnum(MonitoringStatus)
  statut?: MonitoringStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contactGroupId?: string;
}

export class DashboardStatsDto {
  @ApiProperty()
  alertesActives: number;

  @ApiProperty()
  monitoringsEnErreur: number;

  @ApiProperty({ description: 'Pourcentage 0-100' })
  tauxDisponibilite: number;
}

export class MonitoringSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: MonitoringStatus })
  statut: MonitoringStatus;

  @ApiPropertyOptional()
  derniereValeur?: number;

  @ApiPropertyOptional()
  tendance?: 'up' | 'down' | 'stable';
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({ type: [MonitoringSummaryDto] })
  monitorings: MonitoringSummaryDto[];
}
