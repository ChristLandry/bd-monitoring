import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConnectionEntity } from '../../../connections/definitions/model/connection.entity';
import { SqlQueryVersionEntity } from './sql-query-version.entity';

@Entity('sql_queries')
export class SqlQueryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', name: 'corps_requete' })
  corpsRequete: string;

  @Column({ type: 'jsonb', name: 'parametres_dynamiques', default: {} })
  parametresDynamiques: Record<string, unknown>;

  @Column({ name: 'connection_id' })
  connectionId: string;

  @ManyToOne(() => ConnectionEntity, (c) => c.queries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'connection_id' })
  connection: ConnectionEntity;

  @Column({ name: 'timeout_max', type: 'int', default: 30 })
  timeoutMax: number;

  @Column({ type: 'int', default: 1 })
  version: number;

  @UpdateDateColumn({ name: 'date_derniere_modif' })
  dateDerniereModif: Date;

  @OneToMany(() => SqlQueryVersionEntity, (v) => v.query)
  versions: SqlQueryVersionEntity[];
}
