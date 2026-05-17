import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationResponseDto } from '../definitions/dto/notification.dto';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationDeliveryService, AlertPayload } from './notification-delivery.service';
import { MonitoringEntity } from '../../monitorings/definitions/model/monitoring.entity';
import { ContactGroupEntity } from '../../contact-groups/definitions/model/contact-group.entity';
import { NotificationChannel } from '../../monitorings/definitions/model/notification-channel.enum';

@Injectable()
export class NotificationsService {
  private readonly lastAlertByMonitoring = new Map<string, Date>();
  private readonly alertActive = new Map<string, boolean>();

  constructor(
    private readonly repository: NotificationRepository,
    private readonly delivery: NotificationDeliveryService,
    private readonly config: ConfigService,
  ) {}

  async findAll(): Promise<NotificationResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map(NotificationResponseDto.fromEntity);
  }

  async acknowledge(id: string): Promise<NotificationResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Notification ${id} introuvable`);
    }
    entity.acquittee = true;
    entity.dateAcquittement = new Date();
    const saved = await this.repository.save(entity);
    return NotificationResponseDto.fromEntity(saved);
  }

  async handleThresholdAlert(
    monitoring: MonitoringEntity,
    group: ContactGroupEntity,
    valeur: number,
    executionLogId: string,
  ): Promise<boolean> {
    const floodKey = monitoring.id;
    const last = this.lastAlertByMonitoring.get(floodKey);
    const floodMs = monitoring.antiFloodMinutes * 60 * 1000;
    if (last && Date.now() - last.getTime() < floodMs) {
      return false;
    }

    const dashboardUrl = `${this.config.get('DASHBOARD_BASE_URL', 'http://localhost:3000')}/monitorings/${monitoring.id}`;
    const payload: AlertPayload = {
      monitoring,
      valeur,
      seuil: monitoring.seuilNonAcceptation,
      dashboardUrl,
    };

    await this.delivery.send(monitoring.canalNotification, group, payload);

    const notification = this.repository.create({
      monitoringId: monitoring.id,
      executionLogId,
      canal: monitoring.canalNotification,
      contenu: JSON.stringify(payload),
      acquittee: false,
      escalade: false,
    });
    await this.repository.save(notification);

    this.lastAlertByMonitoring.set(floodKey, new Date());
    this.alertActive.set(floodKey, true);
    return true;
  }

  async handleResolved(
    monitoring: MonitoringEntity,
    group: ContactGroupEntity,
    valeur: number,
  ): Promise<void> {
    if (!this.alertActive.get(monitoring.id)) {
      return;
    }
    const dashboardUrl = `${this.config.get('DASHBOARD_BASE_URL')}/monitorings/${monitoring.id}`;
    await this.delivery.send(monitoring.canalNotification, group, {
      monitoring,
      valeur,
      seuil: monitoring.seuilNonAcceptation,
      dashboardUrl,
      resolved: true,
    });
    this.alertActive.set(monitoring.id, false);
  }

  isAntiFloodActive(monitoringId: string, minutes: number): boolean {
    const last = this.lastAlertByMonitoring.get(monitoringId);
    if (!last) return false;
    return Date.now() - last.getTime() < minutes * 60 * 1000;
  }
}
