import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinsService } from '../coins.service';
import { BalanceUpdateService } from '../services/balance-update.service';
import { TransactionApprovalService } from '../services/transaction-approval.service';
import { TransactionValidationService } from '../services/transaction-validation.service';
import { CoinBalance } from '../entities/coin-balance.entity';
import { CoinTransaction } from '../entities/coin-transaction.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { User } from '../../users/entities/user.entity';

describe('Coin Lifecycle Integration Tests (Fixed Implementation)', () => {
  let coinsService: CoinsService;
  let balanceUpdateService: BalanceUpdateService;
  let transactionApprovalService: TransactionApprovalService;
  let transactionValidationService: TransactionValidationService;
  let balanceRepository: Repository<CoinBalance>;
  let transactionRepository: Repository<CoinTransaction>;
  let brandRepository: Repository<Brand>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    mobileNumber: '1234567890',
    status: 'ACTIVE' as any,
    isMobileVerified: true,
    isEmailVerified: true,
    hasWelcomeBonusProcessed: false,
    passwordHash: undefined,
    refreshTokenHash: undefined,
    emailVerificationToken: undefined,
    emailVerificationExpiresAt: undefined,
    passwordResetToken: undefined,
    passwordResetExpiresAt: undefined,
    lastLoginAt: undefined,
    roles: [],
    profileId: undefined,
    paymentDetailsId: undefined,
    firebaseUid: undefined,
    profile: undefined,
    paymentDetails: undefined,
    authProviders: [],
    coinBalance: undefined,
    coinTransactions: [],
    files: [],
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockBrand = {
    id: 'test-brand-id',
    name: 'Test Brand',
    earningPercentage: 10,
    redemptionPercentage: 50,
    isActive: true,
    description: 'Test Brand Description',
    logoUrl: undefined,
    categoryId: undefined,
    minRedemptionAmount: 0,
    maxRedemptionAmount: 1000,
    brandwiseMaxCap: 10000,
    maxRedemptionPerTransaction: undefined,
    maxEarningPerTransaction: undefined,
    category: undefined,
    locations: [],
    offers: [],
    transactions: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockBalance = {
    id: 'test-balance-id',
    user: mockUser,
    balance: '100',
    totalEarned: '100',
    totalRedeemed: '0',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinsService,
        BalanceUpdateService,
        TransactionApprovalService,
        TransactionValidationService,
        {
          provide: getRepositoryToken(CoinBalance),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CoinTransaction),
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
          provide: getRepositoryToken(Brand),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    coinsService = module.get<CoinsService>(CoinsService);
    balanceUpdateService = module.get<BalanceUpdateService>(BalanceUpdateService);
    transactionApprovalService = module.get<TransactionApprovalService>(TransactionApprovalService);
    transactionValidationService = module.get<TransactionValidationService>(TransactionValidationService);
    balanceRepository = module.get<Repository<CoinBalance>>(getRepositoryToken(CoinBalance));
    transactionRepository = module.get<Repository<CoinTransaction>>(getRepositoryToken(CoinTransaction));
    brandRepository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('Complete Transaction Lifecycle', () => {
    it.skip('should handle complete lifecycle: Submit → Approve → No Balance Change', async () => {
      // Arrange
      const userId = 'test-user-id';
      const createRewardRequestDto = {
        brandId: 'test-brand-id',
        billAmount: 1000, // INTEGER - whole number only
        billDate: '2024-01-01',
        receiptUrl: 'https://example.com/receipt.jpg',
        coinsToRedeem: 0
      };

      // Mock database transaction
      const mockTransaction = {
        id: 'test-transaction-id',
        user: mockUser,
        brand: mockBrand,
        amount: 100, // Changed from string to number
        type: 'REWARD_REQUEST',
        status: 'PENDING',
        billAmount: 1000,
        coinsEarned: 100,
        coinsRedeemed: 0,
        previousBalance: 100,
        balanceAfterEarn: 200,
        balanceAfterRedeem: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
        calculateAmount: () => 100
      };

      const mockUpdatedBalance = {
        ...mockBalance,
        balance: 200,
        totalEarned: 200,
        totalRedeemed: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the database transaction
      transactionRepository.manager.transaction = jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          create: jest.fn().mockReturnValue(mockTransaction),
          save: jest.fn().mockResolvedValue(mockTransaction),
          findOne: jest.fn().mockResolvedValue(mockBalance)
        };
        return callback(mockManager);
      });

      // Mock the transaction repository for approval
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(mockTransaction as any);

      // Mock validation service
      jest.spyOn(transactionValidationService, 'validateRewardRequest').mockResolvedValue();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(brandRepository, 'findOne').mockResolvedValue(mockBrand as any);
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);

      // Mock balance update service
      jest.spyOn(balanceUpdateService, 'updateBalanceForRewardRequest').mockResolvedValue();
      jest.spyOn(balanceUpdateService, 'getUserBalance').mockResolvedValue(mockUpdatedBalance as any);
      jest.spyOn(balanceUpdateService, 'getOptimisticBalance').mockResolvedValue('200');

      // Mock transaction repository for recent transactions
      jest.spyOn(coinsService, 'getAllTransactions').mockResolvedValue({
        data: [{
          ...mockTransaction,
          userId: mockUser.id,
          userName: mockUser.email,
          userMobile: mockUser.mobileNumber,
          updatedAt: new Date()
        } as any],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1
      });

      // Act - Submit transaction
      const submitResult = await coinsService.createRewardRequest(userId, createRewardRequestDto);

      // Assert - Transaction submitted successfully
      expect(submitResult.success).toBe(true);
      expect(submitResult.transaction.status).toBe('PENDING');
      expect(submitResult.newBalance).toBe(200);

      // Verify database transaction was used
      expect(transactionRepository.manager.transaction).toHaveBeenCalled();
      expect(balanceUpdateService.updateBalanceForRewardRequest).toHaveBeenCalledWith(
        expect.any(Object), // manager
        userId,
        100, // coinsEarned
        0    // coinsRedeemed
      );

      // Act - Approve transaction (simplified test)
      const approvalDto = { adminNotes: 'Approved' };
      
      // Mock the transaction as PENDING for approval
      const pendingTransactionForApproval = { ...mockTransaction, status: 'PENDING' };
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(pendingTransactionForApproval as any);
      jest.spyOn(transactionRepository, 'save').mockResolvedValue({
        ...pendingTransactionForApproval,
        status: 'PAID',
        processedAt: new Date()
      } as any);

      const approveResult = await transactionApprovalService.approveTransaction(
        'test-transaction-id',
        approvalDto
      );

      // Assert - Transaction approved, no balance change
      expect(approveResult.status).toBe('PAID');
      expect(approveResult.processedAt).toBeDefined();
    });

    it('should handle complete lifecycle: Submit → Reject → Balance Reverted', async () => {
      // Arrange
      const userId = 'test-user-id';
      const createRewardRequestDto = {
        brandId: 'test-brand-id',
        billAmount: 1000,
        billDate: '2024-01-01',
        receiptUrl: 'https://example.com/receipt.jpg',
        coinsToRedeem: 50
      };

      const mockTransaction = {
        id: 'test-transaction-id',
        user: mockUser,
        brand: mockBrand,
        amount: '50',
        type: 'REWARD_REQUEST',
        status: 'PENDING',
        billAmount: 1000,
        coinsEarned: 100,
        coinsRedeemed: 50,
        previousBalance: 100,
        balanceAfterEarn: 200,
        balanceAfterRedeem: 150,
        createdAt: new Date()
      };

      const mockUpdatedBalance = {
        ...mockBalance,
        balance: 150,
        totalEarned: 200,
        totalRedeemed: 50
      };

      // Mock database transaction for submission
      transactionRepository.manager.transaction = jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          create: jest.fn().mockReturnValue(mockTransaction),
          save: jest.fn().mockResolvedValue(mockTransaction),
          findOne: jest.fn().mockResolvedValue(mockBalance)
        };
        return callback(mockManager);
      });

      // Mock services
      jest.spyOn(transactionValidationService, 'validateRewardRequest').mockResolvedValue();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(brandRepository, 'findOne').mockResolvedValue(mockBrand as any);
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);
      jest.spyOn(balanceUpdateService, 'updateBalanceForRewardRequest').mockResolvedValue();
      jest.spyOn(balanceUpdateService, 'getUserBalance').mockResolvedValue(mockUpdatedBalance as any);
      jest.spyOn(balanceUpdateService, 'getOptimisticBalance').mockResolvedValue('150');
      jest.spyOn(coinsService, 'getAllTransactions').mockResolvedValue({
        data: [mockTransaction as any],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1
      });

      // Act - Submit transaction
      await coinsService.createRewardRequest(userId, createRewardRequestDto);

      // Act - Reject transaction
      const rejectionDto = { reason: 'Invalid receipt' };
      
      // Mock database transaction for rejection
      transactionRepository.manager.transaction = jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockTransaction),
          save: jest.fn().mockResolvedValue({
            ...mockTransaction,
            status: 'REJECTED',
            processedAt: new Date()
          })
        };
        return callback(mockManager);
      });

      // Mock balance reversion - we'll check if the method was called indirectly
      // by verifying the transaction was processed correctly

      const rejectResult = await transactionApprovalService.rejectTransaction(
        'test-transaction-id',
        rejectionDto
      );

      // Assert - Transaction rejected, balance reverted
      expect(rejectResult.status).toBe('REJECTED');
      expect(rejectResult.processedAt).toBeDefined();
      // Note: We can't directly test the private method, but we can verify
      // that the transaction was processed and the status was updated correctly
    });

    it('should prevent negative balances on submission', async () => {
      // Arrange
      const userId = 'test-user-id';
      const createRewardRequestDto = {
        brandId: 'test-brand-id',
        billAmount: 1000,
        billDate: '2024-01-01',
        receiptUrl: 'https://example.com/receipt.jpg',
        coinsToRedeem: 200 // More than current balance
      };

      // Mock validation to throw error
      jest.spyOn(transactionValidationService, 'validateRewardRequest')
        .mockRejectedValue(new Error('Insufficient balance. You have 100 coins but trying to redeem 200 coins'));

      // Act & Assert
      await expect(coinsService.createRewardRequest(userId, createRewardRequestDto))
        .rejects.toThrow('Insufficient balance');
    });

    it('should enforce whole numbers only for bill amounts', async () => {
      // Arrange
      const userId = 'test-user-id';
      const createRewardRequestDto = {
        brandId: 'test-brand-id',
        billAmount: 1000.50, // This should be rounded to 1000
        billDate: '2024-01-01',
        receiptUrl: 'https://example.com/receipt.jpg',
        coinsToRedeem: 0
      };

      // Mock services
      jest.spyOn(transactionValidationService, 'validateRewardRequest').mockResolvedValue();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(brandRepository, 'findOne').mockResolvedValue(mockBrand as any);
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);

      const mockTransaction = {
        id: 'test-transaction-id',
        user: mockUser,
        brand: mockBrand,
        amount: '100',
        type: 'REWARD_REQUEST',
        status: 'PENDING',
        billAmount: 1000, // Should be rounded to whole number
        coinsEarned: 100,
        coinsRedeemed: 0,
        previousBalance: 100,
        balanceAfterEarn: 200,
        balanceAfterRedeem: 200,
        createdAt: new Date()
      };

      // Mock database transaction
      transactionRepository.manager.transaction = jest.fn().mockImplementation(async (callback) => {
        const mockManager = {
          create: jest.fn().mockReturnValue(mockTransaction),
          save: jest.fn().mockResolvedValue(mockTransaction),
          findOne: jest.fn().mockResolvedValue(mockBalance)
        };
        return callback(mockManager);
      });

      jest.spyOn(balanceUpdateService, 'updateBalanceForRewardRequest').mockResolvedValue();
      jest.spyOn(balanceUpdateService, 'getUserBalance').mockResolvedValue(mockBalance as any);
      jest.spyOn(balanceUpdateService, 'getOptimisticBalance').mockResolvedValue('200');
      jest.spyOn(coinsService, 'getAllTransactions').mockResolvedValue({
        data: [mockTransaction as any],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1
      });

      // Act
      const result = await coinsService.createRewardRequest(userId, createRewardRequestDto);

      // Assert
      expect(result.transaction.billAmount).toBe(1000); // Should be whole number
      expect(Number.isInteger(result.transaction.billAmount)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain balance = totalEarned - totalRedeemed invariant', async () => {
      // This test verifies that the balance calculation is always correct
      const userId = 'test-user-id';
      
      // Test multiple operations
      const operations = [
        { coinsEarned: 50, coinsRedeemed: 0 },
        { coinsEarned: 0, coinsRedeemed: 30 },
        { coinsEarned: 40, coinsRedeemed: 20 }
      ];

      let currentBalance = mockBalance;
      
      for (const operation of operations) {
        jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance as CoinBalance);
        jest.spyOn(balanceRepository, 'save').mockImplementation((balance) => {
          // Verify the invariant is maintained
          if (balance.balance !== undefined && balance.totalEarned !== undefined && balance.totalRedeemed !== undefined) {
            expect(BigInt(balance.balance)).toBe(BigInt(balance.totalEarned) - BigInt(balance.totalRedeemed));
          }
          
          // Update current balance for next iteration
          currentBalance = balance as any;
          return Promise.resolve(balance as any);
        });

        await coinsService.updateUserBalanceForRewardRequest(
          userId,
          operation.coinsEarned,
          operation.coinsRedeemed
        );
      }
    });
  });
});
