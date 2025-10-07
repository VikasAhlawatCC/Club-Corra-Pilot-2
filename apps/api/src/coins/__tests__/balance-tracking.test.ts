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

describe('Coin Balance Tracking (Phase 1)', () => {
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
    minRedemptionAmount: 0,
    maxRedemptionAmount: 1000,
    brandwiseMaxCap: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: []
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

  describe('updateUserBalanceForRewardRequest', () => {
    it('should properly track totalEarned and totalRedeemed when earning coins only', async () => {
      // Arrange
      const userId = 'test-user-id';
      const coinsEarned = 50;
      const coinsRedeemed = 0;
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance as any);

      // Act
      await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...mockBalance,
        balance: '150', // 100 + 50 - 0
        totalEarned: '150', // 100 + 50
        totalRedeemed: '0' // unchanged
      });
    });

    it('should properly track totalEarned and totalRedeemed when redeeming coins only', async () => {
      // Arrange
      const userId = 'test-user-id';
      const coinsEarned = 0;
      const coinsRedeemed = 30;
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance as any);

      // Act
      await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...mockBalance,
        balance: '70', // 100 + 0 - 30
        totalEarned: '100', // unchanged
        totalRedeemed: '30' // 0 + 30
      });
    });

    it('should properly track totalEarned and totalRedeemed when both earning and redeeming', async () => {
      // Arrange
      const userId = 'test-user-id';
      const coinsEarned = 40;
      const coinsRedeemed = 20;
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(mockBalance as any);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(mockBalance as any);

      // Act
      await coinsService.updateUserBalanceForRewardRequest(userId, coinsEarned, coinsRedeemed);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...mockBalance,
        balance: '120', // 100 + 40 - 20
        totalEarned: '140', // 100 + 40
        totalRedeemed: '20' // 0 + 20
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
        previousBalance: '100',
        user: null,
        amount: '30',
        type: 'REWARD_REQUEST',
        status: 'PENDING'
      } as CoinTransaction;
      
      const currentBalance = {
        ...mockBalance,
        balance: '130', // 100 + 50 - 20
        totalEarned: '150', // 100 + 50
        totalRedeemed: '20' // 0 + 20
      };
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);

      // Act
      await coinsService.revertUserBalanceForTransaction(userId, transaction);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...currentBalance,
        balance: '100', // reverted to previousBalance
        totalEarned: '100', // 150 - 50
        totalRedeemed: '0' // 20 - 20
      });
    });

    it('should handle reversion when only coins were earned', async () => {
      // Arrange
      const userId = 'test-user-id';
      const transaction = {
        id: 'test-transaction-id',
        coinsEarned: 50,
        coinsRedeemed: 0,
        previousBalance: '100',
        user: null,
        amount: '50',
        type: 'REWARD_REQUEST',
        status: 'PENDING'
      } as CoinTransaction;
      
      const currentBalance = {
        ...mockBalance,
        balance: '150', // 100 + 50
        totalEarned: '150', // 100 + 50
      };
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);

      // Act
      await coinsService.revertUserBalanceForTransaction(userId, transaction);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...currentBalance,
        balance: '100', // reverted to previousBalance
        totalEarned: '100', // 150 - 50
        totalRedeemed: '0' // unchanged
      });
    });

    it('should handle reversion when only coins were redeemed', async () => {
      // Arrange
      const userId = 'test-user-id';
      const transaction = {
        id: 'test-transaction-id',
        coinsEarned: 0,
        coinsRedeemed: 30,
        previousBalance: '100',
        user: null,
        amount: '-30',
        type: 'REWARD_REQUEST',
        status: 'PENDING'
      } as CoinTransaction;
      
      const currentBalance = {
        ...mockBalance,
        balance: '70', // 100 - 30
        totalRedeemed: '30' // 0 + 30
      };
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(currentBalance);
      jest.spyOn(balanceRepository, 'save').mockResolvedValue(currentBalance);

      // Act
      await coinsService.revertUserBalanceForTransaction(userId, transaction);

      // Assert
      expect(balanceRepository.save).toHaveBeenCalledWith({
        ...currentBalance,
        balance: '100', // reverted to previousBalance
        totalEarned: '100', // unchanged
        totalRedeemed: '0' // 30 - 30
      });
    });
  });

  describe('Balance Consistency', () => {
    it('should maintain balance = totalEarned - totalRedeemed invariant', async () => {
      // Arrange
      const userId = 'test-user-id';
      const initialBalance = {
        ...mockBalance,
        balance: '100',
        totalEarned: '100',
        totalRedeemed: '0'
      };
      
      jest.spyOn(balanceRepository, 'findOne').mockResolvedValue(initialBalance);
      jest.spyOn(balanceRepository, 'save').mockImplementation((balance) => {
        // Verify the invariant is maintained
        if (balance.balance !== undefined && balance.totalEarned !== undefined && balance.totalRedeemed !== undefined) {
          expect(BigInt(balance.balance)).toBe(BigInt(balance.totalEarned) - BigInt(balance.totalRedeemed));
        }
        return Promise.resolve(balance as any);
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
