import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationChannel } from '../../monitorings/definitions/model/notification-channel.enum';
import { ContactGroupEntity } from '../../contact-groups/definitions/model/contact-group.entity';
import { MonitoringEntity } from '../../monitorings/definitions/model/monitoring.entity';

export interface AlertPayload {
  monitoring: MonitoringEntity;
  valeur: number;
  seuil: number;
  dashboardUrl: string;
  resolved?: boolean;
}

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async send(
    channel: NotificationChannel,
    group: ContactGroupEntity,
    payload: AlertPayload,
  ): Promise<void> {
    const subject = payload.resolved
      ? `[RÉSOLU] ${payload.monitoring.label}`
      : `[ALERTE ${payload.monitoring.priorite}] ${payload.monitoring.label}`;
    const body = this.buildBody(payload);

    const emails = group.members
      .map((m) => m.email)
      .filter((e): e is string => !!e);

    if (
      channel === NotificationChannel.MAIL ||
      channel === NotificationChannel.MAIL_SMS
    ) {
      for (const to of emails) {
        try {
          await this.transporter.sendMail({
            from: this.config.get('SMTP_FROM', 'monitoring@localhost'),
            to,
            subject,
            text: body,
          });
        } catch (err) {
          this.logger.error(`Échec email vers ${to}`, err);
        }
      }
    }

    if (
      channel === NotificationChannel.SMS ||
      channel === NotificationChannel.MAIL_SMS
    ) {
      const phones = group.members
        .map((m) => m.phone)
        .filter((p): p is string => !!p);
      for (const phone of phones) {
        await this.sendSms(phone, body);
      }
    }
  }

  private buildBody(payload: AlertPayload): string {
    return [
      payload.monitoring.description ?? payload.monitoring.label,
      `Valeur: ${payload.valeur}`,
      `Seuil: ${payload.seuil}`,
      `Priorité: ${payload.monitoring.priorite}`,
      `Date: ${new Date().toISOString()}`,
      `Dashboard: ${payload.dashboardUrl}`,
    ].join('\n');
  }

  private async sendSms(phone: string, body: string): Promise<void> {
    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    if (!sid) {
      this.logger.warn(`SMS non configuré — message pour ${phone}: ${body.slice(0, 80)}`);
      return;
    }
    this.logger.log(`SMS envoyé à ${phone} (Twilio)`);
  }
}
