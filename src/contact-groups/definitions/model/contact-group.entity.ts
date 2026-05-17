import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contact_groups')
export class ContactGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: [] })
  members: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;

  @Column({ type: 'jsonb', name: 'plages_horaires', default: [] })
  plagesHoraires: Array<{ jour: number; debut: string; fin: string }>;

  @Column({ type: 'jsonb', default: [] })
  remplacants: Array<{ name: string; email?: string; phone?: string }>;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification' })
  dateModification: Date;
}
