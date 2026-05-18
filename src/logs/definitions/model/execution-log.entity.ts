import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonitoringEntity } from '../../../monitorings/definitions/model/monitoring.entity';
import { ExecutionStatus } from './execution-status.enum';
import { NotificationChannel } from '../../../monitorings/definitions/model/notification-channel.enum';

@Entity('execution_logs')
export class ExecutionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'id_monitoring', type: 'uuid' })
  idMonitoring: string;

  @ManyToOne(() => MonitoringEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_monitoring' })
  monitoring: MonitoringEntity;

  @CreateDateColumn({ name: 'date_execution' })
  dateExecution: Date;

  @Column({ name: 'valeur_retournee', type: 'float', nullable: true })
  valeurRetournee: number | null;

  @Column({ name: 'seuil_depasse', default: false })
  seuilDepasse: boolean;

  @Column({ name: 'statut_execution', type: 'enum', enum: ExecutionStatus })
  statutExecution: ExecutionStatus;

  @Column({ name: 'duree_ms', type: 'int' })
  dureeMs: number;

  @Column({ name: 'message_erreur', type: 'text', nullable: true })
  messageErreur: string | null;

  @Column({ name: 'notification_envoyee', default: false })
  notificationEnvoyee: boolean;

  @Column({ name: 'canal_utilise', type: 'enum', enum: NotificationChannel, nullable: true })
  canalUtilise: NotificationChannel | null;
}
