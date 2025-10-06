import { DataSource } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { PaymentDetails } from '../users/entities/payment-details.entity';
import { AuthProviderLink, AuthProvider } from '../users/entities/auth-provider.entity';
import { CoinBalance } from '../coins/entities/coin-balance.entity';
import { CoinTransaction, CoinTransactionStatus } from '../coins/entities/coin-transaction.entity';
import { Notification, NotificationType } from '../notifications/notification.entity';
import { WaitlistEntry } from '../waitlist/entities/waitlist-entry.entity';
import { PartnerApplication } from '../partners/entities/partner-application.entity';
import { Offer } from '../brands/entities/offer.entity';
import { File, FileType } from '../files/file.entity';
import { RiskSignal } from '../admin/entities/risk-signal.entity';
import { SavedView } from '../admin/entities/saved-view.entity';
import { ExperimentConfig } from '../admin/entities/experiment-config.entity';
import { DashboardMetricsCache } from '../admin/entities/dashboard-metrics-cache.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { FinancialReconciliation, SettlementStatus } from '../admin/entities/financial-reconciliation.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Admin } from '../admin/entities/admin.entity';

// Import the data source configuration
import { AppDataSource } from '../data-source';

const DUMMY_DATA_CONFIG = {
  users: 50,
  notifications: 200,
  coinTransactions: 300,
  waitlistEntries: 30,
  partnerApplications: 15,
  offers: 25,
  files: 100,
  riskSignals: 40,
  savedViews: 10,
  experimentConfigs: 8,
  dashboardMetricsCache: 12,
  auditLogs: 80,
  financialReconciliation: 20,
};

// Helper function to generate random data
const randomChoice = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Sample data arrays
const firstNames = [
  'Aarav', 'Aditi', 'Arjun', 'Bhavya', 'Chetan', 'Deepika', 'Esha', 'Gaurav', 'Isha', 'Jatin',
  'Kavya', 'Lakshmi', 'Manish', 'Neha', 'Omkar', 'Priya', 'Rahul', 'Sneha', 'Tanvi', 'Umesh',
  'Vikram', 'Yash', 'Zara', 'Ananya', 'Bhavesh', 'Chitra', 'Dev', 'Ekta', 'Faisal', 'Gita'
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Verma', 'Yadav', 'Reddy',
  'Mishra', 'Pandey', 'Shah', 'Mehta', 'Joshi', 'Bansal', 'Arora', 'Malhotra', 'Chopra', 'Khanna'
];

const companyNames = [
  'TechCorp Solutions', 'Digital Innovations', 'CloudTech Systems', 'DataFlow Analytics',
  'SmartBiz Technologies', 'NextGen Solutions', 'CyberSecure Inc', 'AI Dynamics',
  'Blockchain Ventures', 'Quantum Computing', 'RoboTech Labs', 'GreenTech Solutions',
  'FinTech Innovations', 'HealthTech Systems', 'EduTech Platforms', 'RetailTech Solutions'
];

const notificationTitles = [
  'Welcome to Club Corra!', 'Transaction Approved', 'Reward Earned', 'Payment Processed',
  'New Offer Available', 'Account Verified', 'Coin Balance Updated', 'Profile Updated',
  'Security Alert', 'System Maintenance', 'Promotional Offer', 'Transaction Failed'
];

const notificationMessages = [
  'Your account has been successfully created!', 'Your transaction has been approved.',
  'You have earned 50 coins!', 'Your payment has been processed successfully.',
  'Check out our latest offers!', 'Your account verification is complete.',
  'Your coin balance has been updated.', 'Your profile has been updated successfully.',
  'Please verify your recent login activity.', 'Scheduled maintenance will begin shortly.',
  'Special discount available for limited time!', 'Your transaction could not be processed.'
];

const riskSignals = [
  'High transaction frequency', 'Unusual spending pattern', 'Multiple failed login attempts',
  'Suspicious location access', 'Rapid coin accumulation', 'Unusual device usage',
  'Multiple account creation', 'High-value transactions', 'Off-hours activity',
  'Geographic anomaly', 'Device fingerprint mismatch', 'Behavioral anomaly'
];

const experimentKeys = [
  'user_onboarding_flow', 'coin_reward_multiplier', 'notification_timing',
  'dashboard_layout', 'payment_flow', 'referral_bonus', 'gamification_features',
  'ai_recommendations'
];

const auditActions = [
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'TRANSACTION_APPROVED',
  'TRANSACTION_REJECTED', 'COIN_AWARDED', 'COIN_DEDUCTED', 'NOTIFICATION_SENT',
  'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'PROFILE_UPDATED',
  'PAYMENT_PROCESSED', 'OFFER_CREATED', 'OFFER_UPDATED', 'SYSTEM_CONFIG_CHANGED'
];

async function seedUsers(): Promise<User[]> {
  console.log('🌱 Seeding users...');
  const users: User[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.users; i++) {
    const user = new User();
    user.mobileNumber = `+91${randomInt(7000000000, 9999999999)}`;
    user.email = `user${i + 1}@example.com`;
    user.status = randomChoice([UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.SUSPENDED]);
    user.isMobileVerified = Math.random() > 0.3;
    user.isEmailVerified = Math.random() > 0.4;
    user.hasWelcomeBonusProcessed = Math.random() > 0.5;
    user.roles = ['USER'];
    user.lastLoginAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    
    users.push(user);
  }
  
  return await AppDataSource.getRepository(User).save(users);
}

async function seedUserProfiles(users: User[]): Promise<UserProfile[]> {
  console.log('🌱 Seeding user profiles...');
  const profiles: UserProfile[] = [];
  
  for (const user of users) {
    const profile = new UserProfile();
    profile.user = user;
    profile.firstName = randomChoice(firstNames);
    profile.lastName = randomChoice(lastNames);
    
    profiles.push(profile);
  }
  
  return await AppDataSource.getRepository(UserProfile).save(profiles);
}

async function seedPaymentDetails(users: User[]): Promise<PaymentDetails[]> {
  console.log('🌱 Seeding payment details...');
  const paymentDetails: PaymentDetails[] = [];
  
  for (const user of users) {
    const payment = new PaymentDetails();
    payment.userId = user.id;
    payment.upiId = `${user.mobileNumber}@paytm`;
    payment.mobileNumber = user.mobileNumber;
    
    paymentDetails.push(payment);
  }
  
  return await AppDataSource.getRepository(PaymentDetails).save(paymentDetails);
}

async function seedAuthProviders(users: User[]): Promise<AuthProviderLink[]> {
  console.log('🌱 Seeding auth providers...');
  const authProviders: AuthProviderLink[] = [];
  
  for (const user of users) {
    // Each user gets 1-2 auth providers
    const numProviders = randomInt(1, 2);
    const usedProviders = new Set<AuthProvider>();
    
    for (let i = 0; i < numProviders; i++) {
      const provider = randomChoice([AuthProvider.SMS, AuthProvider.EMAIL, AuthProvider.GOOGLE, AuthProvider.FACEBOOK]);
      
      if (!usedProviders.has(provider)) {
        usedProviders.add(provider);
        
        const authProvider = new AuthProviderLink();
        authProvider.userId = user.id;
        authProvider.provider = provider;
        authProvider.providerId = `${provider.toLowerCase()}_${randomInt(100000, 999999)}`;
        authProvider.email = provider === AuthProvider.EMAIL ? user.email : undefined;
        authProvider.linkedAt = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
        
        authProviders.push(authProvider);
      }
    }
  }
  
  return await AppDataSource.getRepository(AuthProviderLink).save(authProviders);
}

async function seedCoinBalances(users: User[]): Promise<CoinBalance[]> {
  console.log('🌱 Seeding coin balances...');
  const coinBalances: CoinBalance[] = [];
  
  for (const user of users) {
    const balance = new CoinBalance();
    balance.user = user;
    balance.balance = randomInt(0, 10000).toString();
    balance.totalEarned = randomInt(1000, 50000).toString();
    balance.totalRedeemed = randomInt(0, parseInt(balance.totalEarned)).toString();
    
    coinBalances.push(balance);
  }
  
  return await AppDataSource.getRepository(CoinBalance).save(coinBalances);
}

async function seedCoinTransactions(users: User[], brands: Brand[]): Promise<CoinTransaction[]> {
  console.log('🌱 Seeding coin transactions...');
  const transactions: CoinTransaction[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.coinTransactions; i++) {
    const transaction = new CoinTransaction();
    transaction.user = randomChoice(users);
    transaction.brand = randomChoice(brands);
    
    const type = randomChoice(['EARN', 'REDEEM', 'BONUS', 'PENALTY', 'REFUND']);
    let amount = 0;
    
    if (type === 'EARN') {
      // For EARN transactions, calculate based on a random bill amount and brand's earning percentage
      const billAmount = randomInt(100, 5000); // Random bill amount between 100-5000
      const earningPercentage = parseFloat(transaction.brand.earningPercentage.toString());
      amount = Math.max(1, Math.round((billAmount * earningPercentage) / 100));
    } else if (type === 'REDEEM') {
      // For REDEEM transactions, calculate based on a random bill amount and brand's redemption percentage
      const billAmount = randomInt(50, 3000); // Random bill amount between 50-3000
      const redemptionPercentage = parseFloat(transaction.brand.redemptionPercentage.toString());
      amount = Math.max(1, Math.round((billAmount * redemptionPercentage) / 100));
    } else {
      // For other transaction types, use random amounts
      amount = randomInt(10, 1000);
    }
    
    transaction.amount = amount.toString();
    transaction.type = type;
    transaction.status = randomChoice(['PENDING', 'COMPLETED', 'FAILED'] as CoinTransactionStatus[]);
    
    transactions.push(transaction);
  }
  
  return await AppDataSource.getRepository(CoinTransaction).save(transactions);
}

async function seedNotifications(users: User[]): Promise<Notification[]> {
  console.log('🌱 Seeding notifications...');
  const notifications: Notification[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.notifications; i++) {
    const notification = new Notification();
    notification.userId = randomChoice(users).id;
    notification.type = randomChoice(Object.values(NotificationType));
    notification.title = randomChoice(notificationTitles);
    notification.message = randomChoice(notificationMessages);
    notification.data = {
      transactionId: randomInt(1000, 9999),
      amount: randomInt(10, 1000),
      timestamp: new Date().toISOString()
    };
    notification.isRead = Math.random() > 0.4;
    notification.readAt = notification.isRead ? randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) : undefined;
    
    notifications.push(notification);
  }
  
  return await AppDataSource.getRepository(Notification).save(notifications);
}

async function seedWaitlistEntries(): Promise<WaitlistEntry[]> {
  console.log('🌱 Seeding waitlist entries...');
  const entries: WaitlistEntry[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.waitlistEntries; i++) {
    const entry = new WaitlistEntry();
    entry.email = `waitlist${i + 1}@example.com`;
    entry.source = randomChoice(['website', 'social_media', 'referral', 'advertisement', 'organic']);
    entry.status = randomChoice(['pending', 'approved', 'rejected', 'onboarded']);
    entry.adminNotes = Math.random() > 0.7 ? `Notes for entry ${i + 1}` : null;
    
    entries.push(entry);
  }
  
  return await AppDataSource.getRepository(WaitlistEntry).save(entries);
}

async function seedPartnerApplications(): Promise<PartnerApplication[]> {
  console.log('🌱 Seeding partner applications...');
  const applications: PartnerApplication[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.partnerApplications; i++) {
    const application = new PartnerApplication();
    application.companyName = randomChoice(companyNames);
    application.contactEmail = `partner${i + 1}@${application.companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    application.details = {
      businessType: randomChoice(['retail', 'restaurant', 'service', 'ecommerce', 'tech']),
      employeeCount: randomInt(10, 1000),
      annualRevenue: randomInt(100000, 10000000),
      partnershipType: randomChoice(['exclusive', 'non-exclusive', 'strategic'])
    };
    application.status = randomChoice(['pending', 'under_review', 'approved', 'rejected']);
    application.adminNotes = Math.random() > 0.6 ? `Review notes for ${application.companyName}` : null;
    
    applications.push(application);
  }
  
  return await AppDataSource.getRepository(PartnerApplication).save(applications);
}

async function seedOffers(brands: Brand[]): Promise<Offer[]> {
  console.log('🌱 Seeding offers...');
  const offers: Offer[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.offers; i++) {
    const offer = new Offer();
    offer.brandId = randomChoice(brands).id;
    offer.title = `Special Offer ${i + 1}`;
    offer.description = `Get amazing discounts and rewards with this exclusive offer!`;
    offer.termsAndConditions = `Terms and conditions apply. Valid for limited time only.`;
    offer.startDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    offer.endDate = randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    offer.isActive = Math.random() > 0.2;
    
    offers.push(offer);
  }
  
  return await AppDataSource.getRepository(Offer).save(offers);
}

async function seedFiles(users: User[]): Promise<File[]> {
  console.log('🌱 Seeding files...');
  const files: File[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.files; i++) {
    const file = new File();
    file.userId = randomChoice(users).id;
    file.fileName = `file_${i + 1}.jpg`;
    file.originalName = `user_upload_${i + 1}.jpg`;
    file.mimeType = randomChoice(['image/jpeg', 'image/png', 'application/pdf', 'text/plain']);
    file.size = randomInt(1024, 10 * 1024 * 1024); // 1KB to 10MB
    file.url = `https://storage.example.com/files/${file.fileName}`;
    file.type = randomChoice(Object.values(FileType));
    file.description = Math.random() > 0.5 ? `File description ${i + 1}` : undefined;
    
    files.push(file);
  }
  
  return await AppDataSource.getRepository(File).save(files);
}

async function seedRiskSignals(users: User[]): Promise<RiskSignal[]> {
  console.log('🌱 Seeding risk signals...');
  const signals: RiskSignal[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.riskSignals; i++) {
    const signal = new RiskSignal();
    signal.user = randomChoice(users);
    signal.signal = randomChoice(riskSignals);
    signal.metadata = {
      severity: randomChoice(['low', 'medium', 'high']),
      confidence: randomFloat(0.5, 1.0),
      timestamp: new Date().toISOString(),
      source: randomChoice(['behavioral_analysis', 'transaction_monitoring', 'device_fingerprinting'])
    };
    
    signals.push(signal);
  }
  
  return await AppDataSource.getRepository(RiskSignal).save(signals);
}

async function seedSavedViews(admins: Admin[]): Promise<SavedView[]> {
  console.log('🌱 Seeding saved views...');
  const views: SavedView[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.savedViews; i++) {
    const view = new SavedView();
    view.owner = randomChoice(admins);
    view.name = `Dashboard View ${i + 1}`;
    view.config = {
      filters: {
        dateRange: 'last_30_days',
        status: 'active',
        category: 'all'
      },
      columns: ['id', 'name', 'email', 'status', 'createdAt'],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    views.push(view);
  }
  
  return await AppDataSource.getRepository(SavedView).save(views);
}

async function seedExperimentConfigs(): Promise<ExperimentConfig[]> {
  console.log('🌱 Seeding experiment configs...');
  const configs: ExperimentConfig[] = [];
  
  for (const key of experimentKeys) {
    const config = new ExperimentConfig();
    config.key = key;
    config.value = {
      enabled: Math.random() > 0.3,
      variant: randomChoice(['control', 'treatment_a', 'treatment_b']),
      trafficAllocation: randomFloat(0.1, 1.0),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    configs.push(config);
  }
  
  return await AppDataSource.getRepository(ExperimentConfig).save(configs);
}

async function seedDashboardMetricsCache(): Promise<DashboardMetricsCache[]> {
  console.log('🌱 Seeding dashboard metrics cache...');
  const cacheEntries: DashboardMetricsCache[] = [];
  
  const metrics = [
    'total_users', 'active_users', 'total_transactions', 'revenue_metrics',
    'user_growth', 'retention_rates', 'conversion_rates', 'engagement_metrics',
    'geographic_distribution', 'device_analytics', 'payment_methods', 'error_rates'
  ];
  
  for (const metric of metrics) {
    const cache = new DashboardMetricsCache();
    cache.key = metric;
    cache.value = {
      value: randomInt(100, 10000),
      trend: randomChoice(['up', 'down', 'stable']),
      percentage: randomFloat(-20, 20),
      lastUpdated: new Date().toISOString()
    };
    cache.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    cacheEntries.push(cache);
  }
  
  return await AppDataSource.getRepository(DashboardMetricsCache).save(cacheEntries);
}

async function seedAuditLogs(admins: Admin[]): Promise<AuditLog[]> {
  console.log('🌱 Seeding audit logs...');
  const logs: AuditLog[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.auditLogs; i++) {
    const log = new AuditLog();
    log.actor = Math.random() > 0.3 ? randomChoice(admins) : null;
    log.action = randomChoice(auditActions);
    log.details = {
      entityId: randomInt(1000, 9999),
      entityType: randomChoice(['user', 'transaction', 'offer', 'notification']),
      changes: {
        field: randomChoice(['status', 'email', 'phone', 'balance']),
        oldValue: 'old_value',
        newValue: 'new_value'
      },
      ipAddress: `192.168.1.${randomInt(1, 254)}`,
      userAgent: 'Mozilla/5.0 (compatible; AdminPanel/1.0)'
    };
    
    logs.push(log);
  }
  
  return await AppDataSource.getRepository(AuditLog).save(logs);
}

async function seedFinancialReconciliation(brands: Brand[]): Promise<FinancialReconciliation[]> {
  console.log('🌱 Seeding financial reconciliation...');
  const reconciliations: FinancialReconciliation[] = [];
  
  for (let i = 0; i < DUMMY_DATA_CONFIG.financialReconciliation; i++) {
    const reconciliation = new FinancialReconciliation();
    reconciliation.brandId = randomChoice(brands).id;
    reconciliation.brandName = randomChoice(companyNames);
    reconciliation.pendingAmount = randomFloat(1000, 50000);
    reconciliation.settledAmount = randomFloat(0, reconciliation.pendingAmount);
    reconciliation.lastSettlementDate = Math.random() > 0.5 ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : undefined;
    reconciliation.nextSettlementDate = randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    reconciliation.status = randomChoice(['pending', 'processing', 'completed', 'failed'] as SettlementStatus[]);
    reconciliation.notes = Math.random() > 0.6 ? `Settlement notes for ${reconciliation.brandName}` : undefined;
    
    reconciliations.push(reconciliation);
  }
  
  return await AppDataSource.getRepository(FinancialReconciliation).save(reconciliations);
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Get existing brands and admins for foreign key references
    const brands = await AppDataSource.getRepository(Brand).find();
    const admins = await AppDataSource.getRepository(Admin).find();
    
    if (brands.length === 0) {
      console.log('⚠️  No brands found. Please seed brands first.');
      return;
    }
    
    if (admins.length === 0) {
      console.log('⚠️  No admins found. Please seed admins first.');
      return;
    }
    
    // Seed data in order (respecting foreign key constraints)
    const users = await seedUsers();
    await seedUserProfiles(users);
    await seedPaymentDetails(users);
    await seedAuthProviders(users);
    await seedCoinBalances(users);
    await seedCoinTransactions(users, brands);
    await seedNotifications(users);
    await seedWaitlistEntries();
    await seedPartnerApplications();
    await seedOffers(brands);
    await seedFiles(users);
    await seedRiskSignals(users);
    await seedSavedViews(admins);
    await seedExperimentConfigs();
    await seedDashboardMetricsCache();
    await seedAuditLogs(admins);
    await seedFinancialReconciliation(brands);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded ${DUMMY_DATA_CONFIG.users} users with related data`);
    console.log(`📊 Seeded ${DUMMY_DATA_CONFIG.notifications} notifications`);
    console.log(`📊 Seeded ${DUMMY_DATA_CONFIG.coinTransactions} coin transactions`);
    console.log(`📊 And many more records across all tables!`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seeding script
if (require.main === module) {
  main().catch(console.error);
}

export { main as seedDummyData };
