import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MonitoringRepository } from './repository/monitoring.repository';
import { MonitoringExecutionService } from './monitoring-execution.service';
import { MonitoringEntity } from '../definitions/model/monitoring.entity';
import { MonitoringStatus } from '../definitions/model/monitoring-status.enum';

@Injectable()
export class MonitoringSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringSchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly repository: MonitoringRepository,
    private readonly execution: MonitoringExecutionService,
  ) {}

  async onModuleInit(): Promise<void> {
    const active = await this.repository.findActive();
    for (const m of active) {
      this.schedule(m);
    }
    this.logger.log(`${active.length} monitorings planifiés au démarrage`);
  }

  schedule(monitoring: MonitoringEntity): void {
    const name = this.jobName(monitoring.id);
    this.unschedule(monitoring.id);

    if (monitoring.statut !== MonitoringStatus.ACTIF) {
      return;
    }

    const job = new CronJob(monitoring.frequenceCron, () => {
      void this.execution.executeMonitoring(monitoring.id);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.debug(`Job planifié: ${name} (${monitoring.frequenceCron})`);
  }

  unschedule(monitoringId: string): void {
    const name = this.jobName(monitoringId);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.schedulerRegistry.deleteCronJob(name);
    } catch {
      /* job inexistant */
    }
  }

  reschedule(monitoring: MonitoringEntity): void {
    this.schedule(monitoring);
  }

  suspend(monitoringId: string): void {
    const name = this.jobName(monitoringId);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
    } catch {
      /* ignore */
    }
  }

  private jobName(id: string): string {
    return `monitoring-${id}`;
  }
}
