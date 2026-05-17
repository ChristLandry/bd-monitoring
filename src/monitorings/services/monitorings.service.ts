import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import {
  CreateMonitoringDto,
  MonitoringFilterDto,
  MonitoringResponseDto,
  UpdateMonitoringDto,
} from '../definitions/dto/monitoring.dto';
import { MonitoringStatus } from '../definitions/model/monitoring-status.enum';
import { MonitoringRepository } from './repository/monitoring.repository';
import { MonitoringSchedulerService } from './monitoring-scheduler.service';
import { MonitoringExecutionService } from './monitoring-execution.service';
import { QueriesService } from '../../queries/services/queries.service';
import { ContactGroupsService } from '../../contact-groups/services/contact-groups.service';
import {
  normalizeCronExpression,
  resolveMonitoringCronExpression,
} from '../definitions/class/cron-expression.util';

@Injectable()
export class MonitoringsService {
  constructor(
    private readonly repository: MonitoringRepository,
    private readonly scheduler: MonitoringSchedulerService,
    private readonly execution: MonitoringExecutionService,
    private readonly queriesService: QueriesService,
    private readonly contactGroupsService: ContactGroupsService,
  ) {}

  async create(dto: CreateMonitoringDto): Promise<MonitoringResponseDto> {
    const frequenceCron = resolveMonitoringCronExpression(dto);
    this.validateCron(frequenceCron);

    await this.queriesService.getEntityOrFail(dto.queryId);
    await this.contactGroupsService.getOrFail(dto.contactGroupId);
    if (dto.escaladeGroupId) {
      await this.contactGroupsService.getOrFail(dto.escaladeGroupId);
    }
    if (dto.correctionQueryId) {
      await this.queriesService.getEntityOrFail(dto.correctionQueryId);
    }

    const statut = dto.statut ?? MonitoringStatus.INACTIF;

    const entity = this.repository.create({
      label: dto.label,
      description: dto.description ?? null,
      queryId: dto.queryId,
      seuilNonAcceptation: dto.seuilNonAcceptation,
      operateurSeuil: dto.operateurSeuil,
      frequenceCron,
      canalNotification: dto.canalNotification,
      priorite: dto.priorite,
      contactGroupId: dto.contactGroupId,
      statut,
      antiFloodMinutes: dto.antiFloodMinutes ?? 15,
      escaladeMinutes: dto.escaladeMinutes ?? 30,
      escaladeGroupId: dto.escaladeGroupId ?? null,
      correctionQueryId: dto.correctionQueryId ?? null,
    });
    const saved = await this.repository.save(entity);
    this.scheduler.register(saved);
    return MonitoringResponseDto.fromEntity(saved);
  }

  async findAll(
    filters: MonitoringFilterDto,
  ): Promise<MonitoringResponseDto[]> {
    const list = await this.repository.findAll({
      statut: filters.statut,
      priorite: filters.priorite,
      contactGroupId: filters.contactGroupId,
    });
    return list.map(MonitoringResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<MonitoringResponseDto> {
    const entity = await this.getOrFail(id);
    return MonitoringResponseDto.fromEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateMonitoringDto,
  ): Promise<MonitoringResponseDto> {
    const entity = await this.getOrFail(id);

    const cronChanged =
      dto.frequenceCron !== undefined || dto.intervalSeconds !== undefined;

    if (cronChanged) {
      const frequenceCron = resolveMonitoringCronExpression({
        frequenceCron: dto.frequenceCron ?? entity.frequenceCron,
        intervalSeconds: dto.intervalSeconds,
      });
      this.validateCron(frequenceCron);
      entity.frequenceCron = frequenceCron;
    }

    Object.assign(entity, {
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.queryId !== undefined && { queryId: dto.queryId }),
      ...(dto.seuilNonAcceptation !== undefined && {
        seuilNonAcceptation: dto.seuilNonAcceptation,
      }),
      ...(dto.operateurSeuil !== undefined && {
        operateurSeuil: dto.operateurSeuil,
      }),
      ...(dto.canalNotification !== undefined && {
        canalNotification: dto.canalNotification,
      }),
      ...(dto.priorite !== undefined && { priorite: dto.priorite }),
      ...(dto.contactGroupId !== undefined && {
        contactGroupId: dto.contactGroupId,
      }),
      ...(dto.antiFloodMinutes !== undefined && {
        antiFloodMinutes: dto.antiFloodMinutes,
      }),
      ...(dto.escaladeMinutes !== undefined && {
        escaladeMinutes: dto.escaladeMinutes,
      }),
      ...(dto.escaladeGroupId !== undefined && {
        escaladeGroupId: dto.escaladeGroupId,
      }),
      ...(dto.correctionQueryId !== undefined && {
        correctionQueryId: dto.correctionQueryId,
      }),
    });

    const saved = await this.repository.save(entity);
    if (cronChanged) {
      this.scheduler.reschedule(saved);
    }
    return MonitoringResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.getOrFail(id);
    this.scheduler.unschedule(id);
    await this.repository.remove(entity);
  }

  async activate(id: string): Promise<MonitoringResponseDto> {
    const entity = await this.getOrFail(id);
    entity.statut = MonitoringStatus.ACTIF;
    const saved = await this.repository.save(entity);
    this.scheduler.register(saved);
    return MonitoringResponseDto.fromEntity(saved);
  }

  async deactivate(id: string): Promise<MonitoringResponseDto> {
    const entity = await this.getOrFail(id);
    entity.statut = MonitoringStatus.INACTIF;
    const saved = await this.repository.save(entity);
    this.scheduler.suspend(id);
    return MonitoringResponseDto.fromEntity(saved);
  }

  async runNow(id: string): Promise<{ message: string }> {
    await this.getOrFail(id);
    void this.execution.executeMonitoring(id);
    return { message: 'Exécution manuelle démarrée' };
  }

  countByStatus(statut: MonitoringStatus) {
    return this.repository.countByStatus(statut);
  }

  private async getOrFail(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Monitoring ${id} introuvable`);
    }
    return entity;
  }

  private validateCron(expression: string): void {
    try {
      const normalized = normalizeCronExpression(expression);
      CronExpressionParser.parse(normalized);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Expression cron invalide';
      throw new BadRequestException(message);
    }
  }
}
