import { Injectable, Logger } from '@nestjs/common';
import { QueryExecutionService } from '../../connections/services/query-execution.service';
import { QueriesService } from '../../queries/services/queries.service';
import { ConnectionsService } from '../../connections/services/connections.service';
import { LogsService } from '../../logs/services/logs.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { ContactGroupsService } from '../../contact-groups/services/contact-groups.service';
import { MonitoringEntity } from '../definitions/model/monitoring.entity';
import { MonitoringStatus } from '../definitions/model/monitoring-status.enum';
import { ThresholdEvaluator } from '../definitions/class/threshold-evaluator.class';
import { ExecutionStatus } from '../../logs/definitions/model/execution-status.enum';
import { MonitoringRepository } from './repository/monitoring.repository';
import { Priority } from '../definitions/model/priority.enum';

@Injectable()
export class MonitoringExecutionService {
  private readonly logger = new Logger(MonitoringExecutionService.name);
  private readonly locks = new Set<string>();

  constructor(
    private readonly monitoringRepository: MonitoringRepository,
    private readonly queryExecution: QueryExecutionService,
    private readonly queriesService: QueriesService,
    private readonly connectionsService: ConnectionsService,
    private readonly logsService: LogsService,
    private readonly notificationsService: NotificationsService,
    private readonly contactGroupsService: ContactGroupsService,
  ) {}

  async executeMonitoring(monitoringId: string): Promise<void> {
    if (this.locks.has(monitoringId)) {
      this.logger.warn(`Exécution déjà en cours pour ${monitoringId}`);
      return;
    }
    this.locks.add(monitoringId);
    try {
      const monitoring = await this.monitoringRepository.findById(
        monitoringId,
        true,
      );
      if (!monitoring?.query) {
        return;
      }

      const query = await this.queriesService.getEntityOrFail(monitoring.queryId);
      const connection = await this.connectionsService.getEntityOrFail(
        query.connectionId,
      );

      const outcome = await this.queryExecution.execute({
        connection,
        sql: query.corpsRequete,
        parameters: query.parametresDynamiques,
        timeoutSeconds: query.timeoutMax,
      });

      if (!outcome.success) {
        await this.logAndFail(monitoring, outcome.error.code as ExecutionStatus, outcome.error.message, outcome.error.durationMs, null);
        monitoring.statut = MonitoringStatus.EN_ERREUR;
        await this.monitoringRepository.save(monitoring);
        return;
      }

      const value = outcome.result.value as number;
      const exceeded = ThresholdEvaluator.isThresholdExceeded(
        value,
        monitoring.seuilNonAcceptation,
        monitoring.operateurSeuil,
      );

      const log = await this.logsService.createLog({
        idMonitoring: monitoring.id,
        valeurRetournee: value,
        seuilDepasse: exceeded,
        statutExecution: exceeded ? ExecutionStatus.KO : ExecutionStatus.OK,
        dureeMs: outcome.result.durationMs,
        messageErreur: null,
        notificationEnvoyee: false,
        canalUtilise: null,
      });

      if (exceeded) {
        const group = await this.contactGroupsService.getOrFail(
          monitoring.contactGroupId,
        );
        const sent = await this.notificationsService.handleThresholdAlert(
          monitoring,
          group,
          value,
          log.id,
        );
        if (sent) {
          log.notificationEnvoyee = true;
          log.canalUtilise = monitoring.canalNotification;
          await this.logsService.createLog(log);
        }

        if (
          monitoring.correctionQueryId &&
          monitoring.priorite === Priority.CRITIQUE
        ) {
          await this.runCorrection(monitoring);
        }

        if (monitoring.statut !== MonitoringStatus.EN_ERREUR) {
          monitoring.statut = MonitoringStatus.ACTIF;
        }
      } else {
        const group = await this.contactGroupsService.getOrFail(
          monitoring.contactGroupId,
        );
        await this.notificationsService.handleResolved(
          monitoring,
          group,
          value,
        );
        if (monitoring.statut === MonitoringStatus.EN_ERREUR) {
          monitoring.statut = MonitoringStatus.ACTIF;
        }
      }

      await this.monitoringRepository.save(monitoring);
    } finally {
      this.locks.delete(monitoringId);
    }
  }

  private async runCorrection(monitoring: MonitoringEntity): Promise<void> {
    if (!monitoring.correctionQueryId) return;
    const query = await this.queriesService.getEntityOrFail(
      monitoring.correctionQueryId,
    );
    const connection = await this.connectionsService.getEntityOrFail(
      query.connectionId,
    );
    await this.queryExecution.execute({
      connection,
      sql: query.corpsRequete,
      parameters: query.parametresDynamiques,
      timeoutSeconds: query.timeoutMax,
    });
    this.logger.log(`Requête de correction exécutée pour ${monitoring.id}`);
  }

  private async logAndFail(
    monitoring: MonitoringEntity,
    statut: ExecutionStatus,
    message: string,
    dureeMs: number,
    valeur: number | null,
  ) {
    await this.logsService.createLog({
      idMonitoring: monitoring.id,
      valeurRetournee: valeur,
      seuilDepasse: false,
      statutExecution: statut,
      dureeMs,
      messageErreur: message,
      notificationEnvoyee: false,
      canalUtilise: null,
    });
  }
}
