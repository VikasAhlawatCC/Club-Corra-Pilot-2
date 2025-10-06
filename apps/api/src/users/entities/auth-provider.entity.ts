import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuthProvider {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

@Entity('auth_providers')
export class AuthProviderLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: AuthProvider })
  provider!: AuthProvider;

  @Column()
  providerId!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  linkedAt!: Date;

  @ManyToOne(() => User, user => user.authProviders)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
