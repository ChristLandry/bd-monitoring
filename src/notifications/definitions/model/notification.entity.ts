import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonitoringEntity } from '../../../monitorings/definitions/model/monitoring.entity';
import { NotificationChannel } from '../../../monitorings/definitions/model/notification-channel.enum';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'monitoring_id', type: 'uuid' })
  monitoringId: string;

  @ManyToOne(() => MonitoringEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monitoring_id' })
  monitoring: MonitoringEntity;

  @Column({ name: 'execution_log_id', type: 'uuid', nullable: true })
  executionLogId: string | null;

  @Column({ type: 'enum', enum: NotificationChannel })
  canal: NotificationChannel;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ default: false })
  acquittee: boolean;

  @Column({ name: 'date_acquittement', type: 'timestamptz', nullable: true })
  dateAcquittement: Date | null;

  @Column({ default: false })
  escalade: boolean;

  @CreateDateColumn({ name: 'date_envoi' })
  dateEnvoi: Date;
}
