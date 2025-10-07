import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PendingTransactionService } from '../services/pending-transaction.service'
import { CoinsService } from '../coins.service'
import { CreatePendingTransactionDto, ClaimPendingTransactionDto } from '../dto/create-pending-transaction.dto'
import { PendingTransactionResponseDto } from '../dto/pending-transaction-response.dto'
import { AuthenticatedRequest } from '../../common/types/authenticated-request.type'
import { ApiResponseUtil } from '../../common/utils/api-response.util'

@Controller('transactions/pending')
export class PendingTransactionController {
  constructor(
    private readonly pendingTransactionService: PendingTransactionService,
    private readonly coinsService: CoinsService
  ) {}

  /**
   * Create a pending transaction for unauthenticated users
   * This is called from the upload page before authentication
   */
  @Post()
  async createPendingTransaction(
    @Body() dto: CreatePendingTransactionDto
  ) {
    const pendingTransaction = await this.pendingTransactionService.createPendingTransaction(dto)
    
    return ApiResponseUtil.success(
      pendingTransaction,
      'Pending transaction created successfully'
    )
  }

  /**
   * Claim a pending transaction after authentication
   * This is called after successful login/signup
   */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimPendingTransaction(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ClaimPendingTransactionDto
  ) {
    const userId = req.user.id
    
    // Get pending transaction
    const pendingTransaction = await this.pendingTransactionService.claimPendingTransaction(
      dto.sessionId,
      userId
    )

    if (!pendingTransaction) {
      return ApiResponseUtil.success(
        null,
        'No pending transaction found'
      )
    }

    // Create actual reward request with the pending transaction data
    const rewardRequest = await this.coinsService.createRewardRequest(userId, {
      brandId: pendingTransaction.brandId,
      billAmount: pendingTransaction.billAmount,
      billDate: new Date().toISOString(),
      receiptUrl: pendingTransaction.receiptUrl,
      coinsToRedeem: 0, // No redemption for unauthenticated users
    })

    return ApiResponseUtil.success(
      {
        pendingTransaction,
        rewardRequest
      },
      'Pending transaction claimed and reward request created successfully'
    )
  }
}

