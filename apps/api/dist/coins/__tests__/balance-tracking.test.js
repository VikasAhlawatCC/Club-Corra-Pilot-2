"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const coins_service_1 = require("../coins.service");
const balance_update_service_1 = require("../services/balance-update.service");
const transaction_approval_service_1 = require("../services/transaction-approval.service");
const transaction_validation_service_1 = require("../services/transaction-validation.service");
const coin_balance_entity_1 = require("../entities/coin-balance.entity");
const coin_transaction_entity_1 = require("../entities/coin-transaction.entity");
const brand_entity_1 = require("../../brands/entities/brand.entity");
const user_entity_1 = require("../../users/entities/user.entity");
describe('Coin Balance Tracking (Phase 1)', () => {
    let coinsService;
    let balanceUpdateService;
    let transactionApprovalService;
    let transactionValidationService;
    let balanceRepository;
    let transactionRepository;
    let brandRepository;
    let userRepository;
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        mobileNumber: '1234567890'
    };
    const mockBrand = {
        id: 'test-brand-id',
        name: 'Test Brand',
        earningPercentage: 10,
        redemptionPercentage: 50,
        isActive: true
    };
    const mockBalance = {
        id: 'test-balance-id',
        user: mockUser,
        balance: 100,
        totalEarned: 100,
        totalRedeemed: 0
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                coins_service_1.CoinsService,
                balance_update_service_1.BalanceUpdateService,
                transaction_approval_service_1.TransactionApprovalService,
                transaction_validation_service_1.TransactionValidationService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(coin_balance_entity_1.CoinBalance),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        findAndCount: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(coin_transaction_entity_1.CoinTransaction),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        findAndCount: jest.fn(),
                        find: jest.fn(),
                        count: jest.fn(),
                        manager: {
                            transaction: jest.fn(),
                        },
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(brand_entity_1.Brand),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();
        coinsService = module.get(coins_service_1.CoinsService);
        balanceUpdateService = module.get(balance_update_service_1.BalanceUpdateService);
        transactionApprovalService = module.get(transaction_approval_service_1.TransactionApprovalService);
        transactionValidationService = module.get(transaction_validation_service_1.TransactionValidationService);
        balanceRepository = module.get((0, typeorm_1.getRepositoryToken)(coin_balance_entity_1.CoinBalance));
        transactionRepository = module.get((0, typeorm_1.getRepositoryToken)(coin_transaction_entity_1.CoinTransaction));
        brandRepository = module.get((0, typeorm_1.getRepositoryToken)(brand_entity_1.Brand));
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    });
    describe('updateUserBalanceForRewardRequest', () => {
        it('should properly track totalEarned and totalRedeemed when earning coins only', async () => {
            // Arrange
            const userId = 'test-user-id';
            const coinsEarned = 50;
            const coinsRedeemed = 0;
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance);
            // Act
            await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...mockBalance,
                balance: 150, // 100 + 50 - 0
                totalEarned: 150, // 100 + 50
                totalRedeemed: 0 // unchanged
            });
        });
        it('should properly track totalEarned and totalRedeemed when redeeming coins only', async () => {
            // Arrange
            const userId = 'test-user-id';
            const coinsEarned = 0;
            const coinsRedeemed = 30;
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance);
            // Act
            await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...mockBalance,
                balance: 70, // 100 + 0 - 30
                totalEarned: 100, // unchanged
                totalRedeemed: 30 // 0 + 30
            });
        });
        it('should properly track totalEarned and totalRedeemed when both earning and redeeming', async () => {
            // Arrange
            const userId = 'test-user-id';
            const coinsEarned = 40;
            const coinsRedeemed = 20;
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance);
            // Act
            await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...mockBalance,
                balance: 120, // 100 + 40 - 20
                totalEarned: 140, // 100 + 40
                totalRedeemed: 20 // 0 + 20
            });
        });
    });
    describe('revertUserBalanceForTransaction', () => {
        it('should properly revert totalEarned and totalRedeemed when transaction is rejected', async () => {
            // Arrange
            const userId = 'test-user-id';
            const transaction = {
                id: 'test-transaction-id',
                coinsEarned: 50,
                coinsRedeemed: 20,
                previousBalance: 100
            };
            const currentBalance = {
                ...mockBalance,
                balance: 130, // 100 + 50 - 20
                totalEarned: 150, // 100 + 50
                totalRedeemed: 20 // 0 + 20
            };
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);
            // Act
            await coinsService.revertUserBalanceForTransaction(userId, transaction);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...currentBalance,
                balance: 100, // reverted to previousBalance
                totalEarned: 100, // 150 - 50
                totalRedeemed: 0 // 20 - 20
            });
        });
        it('should handle reversion when only coins were earned', async () => {
            // Arrange
            const userId = 'test-user-id';
            const transaction = {
                id: 'test-transaction-id',
                coinsEarned: 50,
                coinsRedeemed: 0,
                previousBalance: 100
            };
            const currentBalance = {
                ...mockBalance,
                balance: 150, // 100 + 50
                totalEarned: 150, // 100 + 50
                totalRedeemed: 0 // unchanged
            };
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);
            // Act
            await coinsService.revertUserBalanceForTransaction(userId, transaction);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...currentBalance,
                balance: 100, // reverted to previousBalance
                totalEarned: 100, // 150 - 50
                totalRedeemed: 0 // unchanged
            });
        });
        it('should handle reversion when only coins were redeemed', async () => {
            // Arrange
            const userId = 'test-user-id';
            const transaction = {
                id: 'test-transaction-id',
                coinsEarned: 0,
                coinsRedeemed: 30,
                previousBalance: 100
            };
            const currentBalance = {
                ...mockBalance,
                balance: 70, // 100 - 30
                totalEarned: 100, // unchanged
                totalRedeemed: 30 // 0 + 30
            };
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
            jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);
            // Act
            await coinsService.revertUserBalanceForTransaction(userId, transaction);
            // Assert
            expect(balanceRepository.save).toHaveBeenCalledWith({
                ...currentBalance,
                balance: 100, // reverted to previousBalance
                totalEarned: 100, // unchanged
                totalRedeemed: 0 // 30 - 30
            });
        });
    });
    describe('Balance Consistency', () => {
        it('should maintain balance = totalEarned - totalRedeemed invariant', async () => {
            // Arrange
            const userId = 'test-user-id';
            const initialBalance = {
                ...mockBalance,
                balance: 100,
                totalEarned: 100,
                totalRedeemed: 0
            };
            jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(initialBalance);
            jest.spyOn(balanceRepository, 'save').mockImplementation((balance) => {
                // Verify the invariant is maintained
                expect(balance.balance).toBe(balance.totalEarned - balance.totalRedeemed);
                return Promise.resolve(balance);
            });
            // Act - Test multiple operations
            await coinsService.updateUserBalanceForRewardRequest(userId, 50, 0); // Earn only
            await coinsService.updateUserBalanceForRewardRequest(userId, 0, 30); // Redeem only
            await coinsService.updateUserBalanceForRewardRequest(userId, 40, 20); // Both
            // Assert - All operations should maintain the invariant
            expect(balanceRepository.save).toHaveBeenCalledTimes(3);
        });
    });
});
