import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from '../../common/definitions/dto/pagination-query.dto';
import {
  LogFilterDto,
  LogResponseDto,
  TrendResponseDto,
} from '../definitions/dto/log.dto';
import { LogRepository } from './repository/log.repository';
import { ExecutionLogEntity } from '../definitions/model/execution-log.entity';
import { ExecutionStatus } from '../definitions/model/execution-status.enum';

@Injectable()
export class LogsService {
  constructor(private readonly repository: LogRepository) {}

  async createLog(data: Partial<ExecutionLogEntity>): Promise<ExecutionLogEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(filters: LogFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const [items, total] = await this.repository.findAll({
      monitoringId: filters.monitoringId,
      statut: filters.statut,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(
      items.map(LogResponseDto.fromEntity),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<LogResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Log ${id} introuvable`);
    }
    return LogResponseDto.fromEntity(entity);
  }

  async findByMonitoring(monitoringId: string): Promise<LogResponseDto[]> {
    const items = await this.repository.findByMonitoring(monitoringId);
    return items.map(LogResponseDto.fromEntity);
  }

  async getTrend(monitoringId: string): Promise<TrendResponseDto> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await this.repository.findTrendData(monitoringId, since);
    const series = logs.map((l) => ({
      date: l.dateExecution,
      value: l.valeurRetournee as number,
    }));
    let driftPercentPerHour = 0;
    if (series.length >= 2) {
      const first = series[0].value;
      const last = series[series.length - 1].value;
      const hours =
        (series[series.length - 1].date.getTime() - series[0].date.getTime()) /
        3600000;
      if (hours > 0 && first !== 0) {
        driftPercentPerHour = ((last - first) / first / hours) * 100;
      }
    }
    return {
      series,
      driftPercentPerHour,
      predictiveFlag: Math.abs(driftPercentPerHour) > 10,
    };
  }

  exportLogs(format: 'csv' | 'pdf', filters: LogFilterDto): string | Buffer {
    const header =
      'id;idMonitoring;dateExecution;valeurRetournee;seuilDepasse;statut\n';
    if (format === 'pdf') {
      return Buffer.from(`PDF export placeholder\n${header}`);
    }
    return header;
  }

  countByStatus(status?: ExecutionStatus): Promise<number> {
    return this.repository
      .findAll({ statut: status, skip: 0, take: 1 })
      .then(([, total]) => total);
  }

  countAlertsActive(): Promise<number> {
    return this.repository
      .findAll({
        statut: ExecutionStatus.KO,
        skip: 0,
        take: 1,
      })
      .then(([, total]) => total);
  }
}
