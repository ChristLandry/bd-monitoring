import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DbType } from './db-type.enum';
import { Environment } from './environment.enum';
import { SqlQueryEntity } from '../../../queries/definitions/model/sql-query.entity';

@Entity('connections')
export class ConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'enum', enum: DbType })
  type: DbType;

  @Column({ length: 512 })
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ length: 255 })
  database: string;

  @Column({ length: 255 })
  username: string;

  @Column({ type: 'text' })
  passwordEncrypted: string;

  @Column({ type: 'enum', enum: Environment, default: Environment.DEV })
  environment: Environment;

  @Column({ default: false })
  sslEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @OneToMany(() => SqlQueryEntity, (q) => q.connection)
  queries: SqlQueryEntity[];
}
