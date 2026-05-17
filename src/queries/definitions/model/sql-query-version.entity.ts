import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SqlQueryEntity } from './sql-query.entity';

@Entity('sql_query_versions')
export class SqlQueryVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'query_id' })
  queryId: string;

  @ManyToOne(() => SqlQueryEntity, (q) => q.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'query_id' })
  query: SqlQueryEntity;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'text', name: 'corps_requete' })
  corpsRequete: string;

  @Column({ type: 'jsonb', name: 'parametres_dynamiques', default: {} })
  parametresDynamiques: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
