import { Injectable } from '@nestjs/common';
import { LogsService } from '../../logs/services/logs.service';
import { MonitoringStatus } from '../../monitorings/definitions/model/monitoring-status.enum';
import {
  DashboardFilterDto,
  DashboardResponseDto,
  MonitoringSummaryDto,
} from '../definitions/dto/dashboard.dto';
import { MonitoringRepository } from '../../monitorings/services/repository/monitoring.repository';
import { LogRepository } from '../../logs/services/repository/log.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly monitoringRepository: MonitoringRepository,
    private readonly logRepository: LogRepository,
    private readonly logsService: LogsService,
  ) {}

  async getDashboard(filters: DashboardFilterDto): Promise<DashboardResponseDto> {
    const monitorings = await this.monitoringRepository.findAll({
      statut: filters.statut,
      priorite: filters.priorite,
      contactGroupId: filters.contactGroupId,
    });

    const enErreur = await this.monitoringRepository.countByStatus(
      MonitoringStatus.EN_ERREUR,
    );
    const alertes = await this.logsService.countAlertsActive();
    const total = monitorings.length || 1;
    const actifs = monitorings.filter(
      (m) => m.statut === MonitoringStatus.ACTIF,
    ).length;

    const summaries: MonitoringSummaryDto[] = [];
    for (const m of monitorings.slice(0, 50)) {
      const logs = await this.logRepository.findByMonitoring(m.id, 2);
      const last = logs[0];
      const prev = logs[1];
      let tendance: 'up' | 'down' | 'stable' = 'stable';
      if (last?.valeurRetournee != null && prev?.valeurRetournee != null) {
        if (last.valeurRetournee > prev.valeurRetournee) tendance = 'up';
        else if (last.valeurRetournee < prev.valeurRetournee) tendance = 'down';
      }
      summaries.push({
        id: m.id,
        label: m.label,
        statut: m.statut,
        derniereValeur: last?.valeurRetournee ?? undefined,
        tendance,
      });
    }

    return {
      stats: {
        alertesActives: alertes,
        monitoringsEnErreur: enErreur,
        tauxDisponibilite: Math.round((actifs / total) * 100),
      },
      monitorings: summaries,
    };
  }
}
