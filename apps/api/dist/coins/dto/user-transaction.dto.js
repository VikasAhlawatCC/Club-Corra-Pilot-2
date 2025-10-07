"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToUserTransactionDto = convertToUserTransactionDto;
/**
 * Converts a CoinTransaction entity to UserTransactionDto for webapp consumption
 */
function convertToUserTransactionDto(transaction) {
    return {
        id: transaction.id,
        brandId: transaction.brand?.id || '',
        brandName: transaction.brand?.name || 'Unknown Brand',
        billAmount: transaction.billAmount || 0,
        coinsEarned: transaction.coinsEarned || 0,
        coinsRedeemed: transaction.coinsRedeemed || 0,
        status: transaction.status,
        receiptUrl: transaction.receiptUrl,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
    };
}
