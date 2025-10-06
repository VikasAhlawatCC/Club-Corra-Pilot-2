import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

export enum FileType {
  RECEIPT = 'RECEIPT',
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER'
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  fileName!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: FileType, default: FileType.OTHER })
  type!: FileType;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, user => user.files)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
