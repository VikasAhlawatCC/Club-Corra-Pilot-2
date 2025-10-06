import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('financial_reconciliation')
export class FinancialReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  brandId!: string;

  @Column()
  brandName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pendingAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  settledAmount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSettlementDate?: Date;

  @Column({ type: 'timestamp' })
  nextSettlementDate!: Date;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING })
  status!: SettlementStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
