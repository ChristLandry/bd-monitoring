import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SqlQueryEntity } from '../../../queries/definitions/model/sql-query.entity';
import { ContactGroupEntity } from '../../../contact-groups/definitions/model/contact-group.entity';
import { ThresholdOperator } from './threshold-operator.enum';
import { MonitoringStatus } from './monitoring-status.enum';
import { NotificationChannel } from './notification-channel.enum';
import { Priority } from './priority.enum';

@Entity('monitorings')
export class MonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'query_id', type: 'uuid' })
  queryId: string;

  @ManyToOne(() => SqlQueryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'query_id' })
  query: SqlQueryEntity;

  @Column({ name: 'seuil_non_acceptation', type: 'float' })
  seuilNonAcceptation: number;

  @Column({ name: 'operateur_seuil', type: 'enum', enum: ThresholdOperator })
  operateurSeuil: ThresholdOperator;

  @Column({ name: 'frequence_cron', length: 100 })
  frequenceCron: string;

  @Column({ type: 'enum', enum: MonitoringStatus, default: MonitoringStatus.INACTIF })
  statut: MonitoringStatus;

  @Column({ name: 'canal_notification', type: 'enum', enum: NotificationChannel })
  canalNotification: NotificationChannel;

  @Column({ type: 'enum', enum: Priority, default: Priority.NORMALE })
  priorite: Priority;

  @Column({ name: 'contact_group_id', type: 'uuid' })
  contactGroupId: string;

  @ManyToOne(() => ContactGroupEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contact_group_id' })
  contactGroup: ContactGroupEntity;

  @Column({ name: 'anti_flood_minutes', type: 'int', default: 15 })
  antiFloodMinutes: number;

  @Column({ name: 'escalade_minutes', type: 'int', default: 30 })
  escaladeMinutes: number;

  @Column({ name: 'escalade_group_id', type: 'uuid', nullable: true })
  escaladeGroupId: string | null;

  @ManyToOne(() => ContactGroupEntity, { nullable: true })
  @JoinColumn({ name: 'escalade_group_id' })
  escaladeGroup: ContactGroupEntity | null;

  @Column({ name: 'correction_query_id', type: 'uuid', nullable: true })
  correctionQueryId: string | null;

  @ManyToOne(() => SqlQueryEntity, { nullable: true })
  @JoinColumn({ name: 'correction_query_id' })
  correctionQuery: SqlQueryEntity | null;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;
}
