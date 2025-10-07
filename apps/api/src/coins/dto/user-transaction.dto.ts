import { CoinTransaction } from '../entities/coin-transaction.entity'

export interface UserTransactionDto {
  id: string
  brandId: string
  brandName: string
  billAmount: number
  coinsEarned: number
  coinsRedeemed: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID' | 'UNPAID' | 'COMPLETED' | 'FAILED'
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

/**
 * Converts a CoinTransaction entity to UserTransactionDto for webapp consumption
 */
export function convertToUserTransactionDto(transaction: CoinTransaction): UserTransactionDto {
  return {
    id: transaction.id,
    brandId: transaction.brand?.id || '',
    brandName: transaction.brand?.name || 'Unknown Brand',
    billAmount: transaction.billAmount || 0,
    coinsEarned: transaction.coinsEarned || 0,
    coinsRedeemed: transaction.coinsRedeemed || 0,
    status: transaction.status as any,
    receiptUrl: transaction.receiptUrl,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  }
}
