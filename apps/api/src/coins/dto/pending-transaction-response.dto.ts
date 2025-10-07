export class PendingTransactionResponseDto {
  id!: string
  sessionId!: string
  brandId!: string
  billAmount!: number
  receiptUrl!: string
  fileName?: string
  expiresAt!: Date
  claimed!: boolean
  claimedBy?: string
  claimedAt?: Date
  createdAt!: Date
}

