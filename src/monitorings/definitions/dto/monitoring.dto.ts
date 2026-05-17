import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DEFAULT_INTERVAL_SECONDS } from '../class/cron-expression.util';
import { ThresholdOperator } from '../model/threshold-operator.enum';
import { MonitoringStatus } from '../model/monitoring-status.enum';
import { NotificationChannel } from '../model/notification-channel.enum';
import { Priority } from '../model/priority.enum';
import { MonitoringEntity } from '../model/monitoring.entity';

export class CreateMonitoringDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  queryId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  seuilNonAcceptation: number;

  @ApiProperty({ enum: ThresholdOperator })
  @IsEnum(ThresholdOperator)
  operateurSeuil: ThresholdOperator;

  @ApiPropertyOptional({
    example: '*/30 * * * * *',
    description:
      'Cron 6 champs (sec min h j m jsem). Si absent, intervalSeconds est utilisé.',
  })
  @ValidateIf((o: CreateMonitoringDto) => o.intervalSeconds === undefined)
  @IsString()
  @IsNotEmpty()
  frequenceCron?: string;

  @ApiPropertyOptional({
    example: DEFAULT_INTERVAL_SECONDS,
    default: DEFAULT_INTERVAL_SECONDS,
    description:
      'Intervalle en secondes (défaut 30). Génère */N * * * * * si frequenceCron est absent.',
  })
  @ValidateIf((o: CreateMonitoringDto) => !o.frequenceCron?.trim())
  @IsInt()
  @Min(1)
  @Max(86400)
  intervalSeconds?: number;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  canalNotification: NotificationChannel;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priorite: Priority;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  contactGroupId: string;

  @ApiPropertyOptional({ default: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  antiFloodMinutes?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  escaladeMinutes?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  escaladeGroupId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  correctionQueryId?: string;

  @ApiPropertyOptional({
    enum: MonitoringStatus,
    default: MonitoringStatus.INACTIF,
    description:
      'INACTIF : cron enregistré mais suspendu. ACTIF : cron démarré à la création.',
  })
  @IsOptional()
  @IsEnum(MonitoringStatus)
  statut?: MonitoringStatus;
}

export class UpdateMonitoringDto extends CreateMonitoringDto {}

export class MonitoringFilterDto {
  @ApiPropertyOptional({ enum: MonitoringStatus })
  @IsOptional()
  @IsEnum(MonitoringStatus)
  statut?: MonitoringStatus;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priorite?: Priority;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  connectionId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contactGroupId?: string;
}

export class MonitoringResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  queryId: string;

  @ApiProperty()
  seuilNonAcceptation: number;

  @ApiProperty({ enum: ThresholdOperator })
  operateurSeuil: ThresholdOperator;

  @ApiProperty()
  frequenceCron: string;

  @ApiProperty({ enum: MonitoringStatus })
  statut: MonitoringStatus;

  @ApiProperty({ enum: NotificationChannel })
  canalNotification: NotificationChannel;

  @ApiProperty({ enum: Priority })
  priorite: Priority;

  @ApiProperty()
  contactGroupId: string;

  @ApiProperty()
  antiFloodMinutes: number;

  @ApiProperty()
  escaladeMinutes: number;

  @ApiPropertyOptional()
  escaladeGroupId?: string | null;

  @ApiPropertyOptional()
  correctionQueryId?: string | null;

  @ApiProperty()
  dateCreation: Date;

  @ApiProperty()
  dateModification: Date;

  static fromEntity(e: MonitoringEntity): MonitoringResponseDto {
    const dto = new MonitoringResponseDto();
    Object.assign(dto, {
      id: e.id,
      label: e.label,
      description: e.description,
      queryId: e.queryId,
      seuilNonAcceptation: e.seuilNonAcceptation,
      operateurSeuil: e.operateurSeuil,
      frequenceCron: e.frequenceCron,
      statut: e.statut,
      canalNotification: e.canalNotification,
      priorite: e.priorite,
      contactGroupId: e.contactGroupId,
      antiFloodMinutes: e.antiFloodMinutes,
      escaladeMinutes: e.escaladeMinutes,
      escaladeGroupId: e.escaladeGroupId,
      correctionQueryId: e.correctionQueryId,
      dateCreation: e.dateCreation,
      dateModification: e.dateModification,
    });
    return dto;
  }
}
