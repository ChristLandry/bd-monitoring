import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MonitoringRepository } from './repository/monitoring.repository';
import { MonitoringExecutionService } from './monitoring-execution.service';
import { MonitoringEntity } from '../definitions/model/monitoring.entity';
import { MonitoringStatus } from '../definitions/model/monitoring-status.enum';
import { normalizeCronExpression } from '../definitions/class/cron-expression.util';

@Injectable()
export class MonitoringSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringSchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly repository: MonitoringRepository,
    private readonly execution: MonitoringExecutionService,
  ) {}

  async onModuleInit(): Promise<void> {
    const monitorings = await this.repository.findAll();
    for (const monitoring of monitorings) {
      this.register(monitoring);
    }
    const active = monitorings.filter(
      (m) => m.statut === MonitoringStatus.ACTIF,
    ).length;
    this.logger.log(
      `${monitorings.length} cron(s) enregistré(s), ${active} actif(s) au démarrage`,
    );
  }

  /**
   * Crée ou remplace le job cron d'un monitoring.
   * Démarre immédiatement si le statut est ACTIF, sinon le job reste suspendu.
   */
  register(monitoring: MonitoringEntity): void {
    const name = this.jobName(monitoring.id);
    this.unschedule(monitoring.id);

    const cronExpression = normalizeCronExpression(monitoring.frequenceCron);
    const job = new CronJob(
      cronExpression,
      () => {
        void this.execution.executeMonitoring(monitoring.id);
      },
      null,
      false,
    );

    this.schedulerRegistry.addCronJob(name, job);

    if (monitoring.statut === MonitoringStatus.ACTIF) {
      job.start();
      this.logger.log(
        `Cron actif: ${name} — expression "${cronExpression}"`,
      );
    } else {
      this.logger.log(
        `Cron enregistré (suspendu): ${name} — expression "${cronExpression}"`,
      );
    }
  }

  /** @deprecated Utiliser register() */
  schedule(monitoring: MonitoringEntity): void {
    this.register(monitoring);
  }

  reschedule(monitoring: MonitoringEntity): void {
    this.register(monitoring);
  }

  start(monitoringId: string): void {
    const name = this.jobName(monitoringId);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (!job.isActive) {
        job.start();
        this.logger.log(`Cron démarré: ${name}`);
      }
    } catch {
      this.logger.warn(
        `Cron introuvable pour ${monitoringId}, enregistrement requis via register()`,
      );
    }
  }

  suspend(monitoringId: string): void {
    const name = this.jobName(monitoringId);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (job.isActive) {
        job.stop();
        this.logger.log(`Cron suspendu: ${name}`);
      }
    } catch {
      /* job inexistant */
    }
  }

  unschedule(monitoringId: string): void {
    const name = this.jobName(monitoringId);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.debug(`Cron supprimé: ${name}`);
    } catch {
      /* job inexistant */
    }
  }

  private jobName(id: string): string {
    return `monitoring-${id}`;
  }
}
