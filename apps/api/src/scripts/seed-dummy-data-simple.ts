#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

// Simple seeding script that uses raw SQL to avoid TypeScript decorator issues
async function seedDummyData() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Check if we have required data
    const brandCount = await queryRunner.query('SELECT COUNT(*) as count FROM brands');
    const adminCount = await queryRunner.query('SELECT COUNT(*) as count FROM admins');
    
    if (brandCount[0].count === 0) {
      console.log('⚠️  No brands found. Please seed brands first.');
      return;
    }
    
    if (adminCount[0].count === 0) {
      console.log('⚠️  No admins found. Please seed admins first.');
      return;
    }
    
    console.log('🌱 Seeding users...');
    
    // Insert users
    const userInserts = [];
    for (let i = 1; i <= 50; i++) {
      const mobileNumber = `+91${Math.floor(Math.random() * 3000000000) + 7000000000}`;
      const email = `user${Date.now()}_${i}@example.com`;
      const status = ['ACTIVE', 'PENDING', 'SUSPENDED'][Math.floor(Math.random() * 3)];
      const isMobileVerified = Math.random() > 0.3;
      const isEmailVerified = Math.random() > 0.4;
      const hasWelcomeBonusProcessed = Math.random() > 0.5;
      
      userInserts.push(`(
        '${mobileNumber}',
        '${email}',
        '${status}',
        ${isMobileVerified},
        ${isEmailVerified},
        ${hasWelcomeBonusProcessed},
        'USER',
        NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'
      )`);
    }
    
    await queryRunner.query(`
      INSERT INTO users ("mobileNumber", "email", "status", "isMobileVerified", "isEmailVerified", "hasWelcomeBonusProcessed", "roles", "lastLoginAt")
      VALUES ${userInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding user profiles...');
    
    // Get user IDs
    const users = await queryRunner.query('SELECT id FROM users ORDER BY "createdAt" DESC LIMIT 50');
    
    // Insert user profiles
    const profileInserts = [];
    const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Bhavya', 'Chetan', 'Deepika', 'Esha', 'Gaurav', 'Isha', 'Jatin'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Verma', 'Yadav', 'Reddy'];
    
    for (const user of users) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      profileInserts.push(`('${user.id}', '${firstName}', '${lastName}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO user_profiles ("user_id", "firstName", "lastName")
      VALUES ${profileInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding payment details...');
    
    // Insert payment details
    const paymentInserts = [];
    for (const user of users) {
      const mobileNumber = `+91${Math.floor(Math.random() * 3000000000) + 7000000000}`;
      paymentInserts.push(`('${user.id}', '${mobileNumber}@paytm', '${mobileNumber}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO payment_details ("userId", "upiId", "mobileNumber")
      VALUES ${paymentInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding coin balances...');
    
    // Insert coin balances
    const coinBalanceInserts = [];
    for (const user of users) {
      const balance = Math.floor(Math.random() * 10000);
      const totalEarned = Math.floor(Math.random() * 50000) + 1000;
      const totalRedeemed = Math.floor(Math.random() * totalEarned);
      coinBalanceInserts.push(`('${user.id}', '${balance}', '${totalEarned}', '${totalRedeemed}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO coin_balances ("userId", "balance", "totalEarned", "totalRedeemed")
      VALUES ${coinBalanceInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding coin transactions...');
    
    // Get brand IDs
    const brands = await queryRunner.query('SELECT id FROM brands LIMIT 10');
    
    // Insert coin transactions
    const transactionInserts = [];
    const transactionTypes = ['EARN', 'REDEEM', 'BONUS', 'PENALTY', 'REFUND'];
    const transactionStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
    
    for (let i = 0; i < 300; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const amount = Math.floor(Math.random() * 1000) + 10;
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const status = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
      
      transactionInserts.push(`('${user.id}', '${brand.id}', '${amount}', '${type}', '${status}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO coin_transactions ("userId", "brandId", "amount", "type", "status")
      VALUES ${transactionInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding notifications...');
    
    // Insert notifications
    const notificationInserts = [];
    const notificationTypes = ['TRANSACTION_APPROVED', 'TRANSACTION_REJECTED', 'PAYMENT_PROCESSED', 'REWARD_EARNED', 'SYSTEM', 'PROMOTIONAL'];
    const titles = ['Welcome to Club Corra!', 'Transaction Approved', 'Reward Earned', 'Payment Processed', 'New Offer Available', 'Account Verified'];
    const messages = ['Your account has been successfully created!', 'Your transaction has been approved.', 'You have earned 50 coins!', 'Your payment has been processed successfully.', 'Check out our latest offers!', 'Your account verification is complete.'];
    
    for (let i = 0; i < 200; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const isRead = Math.random() > 0.4;
      const readAt = isRead ? `NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days'` : 'NULL';
      
      notificationInserts.push(`('${user.id}', '${type}', '${title}', '${message}', ${isRead}, ${readAt})`);
    }
    
    await queryRunner.query(`
      INSERT INTO notifications ("userId", "type", "title", "message", "isRead", "readAt")
      VALUES ${notificationInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding waitlist entries...');
    
    // Insert waitlist entries
    const waitlistInserts = [];
    const sources = ['website', 'social_media', 'referral', 'advertisement', 'organic'];
    const waitlistStatuses = ['pending', 'approved', 'rejected', 'onboarded'];
    
    for (let i = 0; i < 30; i++) {
      const email = `waitlist${Date.now()}_${i + 1}@example.com`;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = waitlistStatuses[Math.floor(Math.random() * waitlistStatuses.length)];
      const adminNotes = Math.random() > 0.7 ? `Notes for entry ${i + 1}` : null;
      
      waitlistInserts.push(`('${email}', '${source}', '${status}', ${adminNotes ? `'${adminNotes}'` : 'NULL'})`);
    }
    
    await queryRunner.query(`
      INSERT INTO waitlist_entries ("email", "source", "status", "adminNotes")
      VALUES ${waitlistInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding partner applications...');
    
    // Insert partner applications
    const partnerInserts = [];
    const companyNames = ['TechCorp Solutions', 'Digital Innovations', 'CloudTech Systems', 'DataFlow Analytics', 'SmartBiz Technologies'];
    const applicationStatuses = ['pending', 'under_review', 'approved', 'rejected'];
    
    for (let i = 0; i < 15; i++) {
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
      const contactEmail = `partner${i + 1}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
      const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
      const adminNotes = Math.random() > 0.6 ? `Review notes for ${companyName}` : null;
      
      partnerInserts.push(`('${companyName}', '${contactEmail}', '${status}', ${adminNotes ? `'${adminNotes}'` : 'NULL'})`);
    }
    
    await queryRunner.query(`
      INSERT INTO partner_applications ("companyName", "contactEmail", "status", "adminNotes")
      VALUES ${partnerInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding offers...');
    
    // Insert offers
    const offerInserts = [];
    for (let i = 0; i < 25; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const title = `Special Offer ${i + 1}`;
      const description = `Get amazing discounts and rewards with this exclusive offer!`;
      const termsAndConditions = `Terms and conditions apply. Valid for limited time only.`;
      const startDate = `NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'`;
      const endDate = `NOW() + INTERVAL '${Math.floor(Math.random() * 30)} days'`;
      const isActive = Math.random() > 0.2;
      
      offerInserts.push(`('${brand.id}', '${title}', '${description}', '${termsAndConditions}', ${startDate}, ${endDate}, ${isActive})`);
    }
    
    await queryRunner.query(`
      INSERT INTO offers ("brandId", "title", "description", "termsAndConditions", "startDate", "endDate", "isActive")
      VALUES ${offerInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding files...');
    
    // Insert files
    const fileInserts = [];
    const fileTypes = ['RECEIPT', 'PROFILE_PICTURE', 'DOCUMENT', 'OTHER'];
    const mimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    
    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const fileName = `file_${i + 1}.jpg`;
      const originalName = `user_upload_${i + 1}.jpg`;
      const mimeType = mimeTypes[Math.floor(Math.random() * mimeTypes.length)];
      const size = Math.floor(Math.random() * 10 * 1024 * 1024) + 1024; // 1KB to 10MB
      const url = `https://storage.example.com/files/${fileName}`;
      const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const description = Math.random() > 0.5 ? `File description ${i + 1}` : null;
      
      fileInserts.push(`('${user.id}', '${fileName}', '${originalName}', '${mimeType}', ${size}, '${url}', '${type}', ${description ? `'${description}'` : 'NULL'})`);
    }
    
    await queryRunner.query(`
      INSERT INTO files ("userId", "fileName", "originalName", "mimeType", "size", "url", "type", "description")
      VALUES ${fileInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding risk signals...');
    
    // Insert risk signals
    const riskSignalInserts = [];
    const signals = ['High transaction frequency', 'Unusual spending pattern', 'Multiple failed login attempts', 'Suspicious location access', 'Rapid coin accumulation'];
    
    for (let i = 0; i < 40; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const signal = signals[Math.floor(Math.random() * signals.length)];
      const severity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
      const confidence = (Math.random() * 0.5 + 0.5).toFixed(2);
      
      riskSignalInserts.push(`('${user.id}', '${signal}', '{"severity": "${severity}", "confidence": ${confidence}}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO risk_signals ("userId", "signal", "metadata")
      VALUES ${riskSignalInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding saved views...');
    
    // Get admin IDs
    const admins = await queryRunner.query('SELECT id FROM admins LIMIT 5');
    
    // Insert saved views
    const savedViewInserts = [];
    for (let i = 0; i < 10; i++) {
      const admin = admins[Math.floor(Math.random() * admins.length)];
      const name = `Dashboard View ${i + 1}`;
      const config = JSON.stringify({
        filters: { dateRange: 'last_30_days', status: 'active', category: 'all' },
        columns: ['id', 'name', 'email', 'status', 'createdAt'],
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      savedViewInserts.push(`('${admin.id}', '${name}', '${config}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO saved_views ("ownerId", "name", "config")
      VALUES ${savedViewInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding experiment configs...');
    
    // Insert experiment configs
    const experimentKeys = ['user_onboarding_flow', 'coin_reward_multiplier', 'notification_timing', 'dashboard_layout', 'payment_flow', 'referral_bonus', 'gamification_features', 'ai_recommendations'];
    
    for (const key of experimentKeys) {
      const value = JSON.stringify({
        enabled: Math.random() > 0.3,
        variant: ['control', 'treatment_a', 'treatment_b'][Math.floor(Math.random() * 3)],
        trafficAllocation: (Math.random() * 0.9 + 0.1).toFixed(2),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await queryRunner.query(`
        INSERT INTO experiment_configs ("key", "value")
        VALUES ('${key}', '${value}')
        ON CONFLICT ("key") DO NOTHING
      `);
    }
    
    console.log('🌱 Seeding dashboard metrics cache...');
    
    // Insert dashboard metrics cache
    const metrics = ['total_users', 'active_users', 'total_transactions', 'revenue_metrics', 'user_growth', 'retention_rates', 'conversion_rates', 'engagement_metrics'];
    
    for (const metric of metrics) {
      const value = JSON.stringify({
        value: Math.floor(Math.random() * 10000) + 100,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
        percentage: (Math.random() * 40 - 20).toFixed(2),
        lastUpdated: new Date().toISOString()
      });
      const expiresAt = `NOW() + INTERVAL '1 hour'`;
      
      await queryRunner.query(`
        INSERT INTO dashboard_metrics_cache ("key", "value", "expiresAt")
        VALUES ('${metric}', '${value}', ${expiresAt})
        ON CONFLICT ("key") DO NOTHING
      `);
    }
    
    console.log('🌱 Seeding audit logs...');
    
    // Insert audit logs
    const auditLogInserts = [];
    const actions = ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'TRANSACTION_APPROVED', 'TRANSACTION_REJECTED', 'COIN_AWARDED', 'COIN_DEDUCTED', 'NOTIFICATION_SENT'];
    
    for (let i = 0; i < 80; i++) {
      const admin = Math.random() > 0.3 ? admins[Math.floor(Math.random() * admins.length)] : null;
      const action = actions[Math.floor(Math.random() * actions.length)];
      const details = JSON.stringify({
        entityId: Math.floor(Math.random() * 9999) + 1000,
        entityType: ['user', 'transaction', 'offer', 'notification'][Math.floor(Math.random() * 4)],
        changes: { field: 'status', oldValue: 'old_value', newValue: 'new_value' },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (compatible; AdminPanel/1.0)'
      });
      
      auditLogInserts.push(`(${admin ? `'${admin.id}'` : 'NULL'}, '${action}', '${details}')`);
    }
    
    await queryRunner.query(`
      INSERT INTO audit_logs ("actorId", "action", "details")
      VALUES ${auditLogInserts.join(', ')}
    `);
    
    console.log('🌱 Seeding financial reconciliation...');
    
    // Insert financial reconciliation
    const reconciliationInserts = [];
    const reconciliationStatuses = ['pending', 'processing', 'completed', 'failed'];
    
    for (let i = 0; i < 20; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const brandName = companyNames[Math.floor(Math.random() * companyNames.length)];
      const pendingAmount = (Math.random() * 49000 + 1000).toFixed(2);
      const settledAmount = (Math.random() * parseFloat(pendingAmount)).toFixed(2);
      const lastSettlementDate = Math.random() > 0.5 ? `NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days'` : 'NULL';
      const nextSettlementDate = `NOW() + INTERVAL '${Math.floor(Math.random() * 7)} days'`;
      const status = reconciliationStatuses[Math.floor(Math.random() * reconciliationStatuses.length)];
      const notes = Math.random() > 0.6 ? `Settlement notes for ${brandName}` : null;
      
      reconciliationInserts.push(`('${brand.id}', '${brandName}', ${pendingAmount}, ${settledAmount}, ${lastSettlementDate}, ${nextSettlementDate}, '${status}', ${notes ? `'${notes}'` : 'NULL'})`);
    }
    
    await queryRunner.query(`
      INSERT INTO financial_reconciliation ("brandId", "brandName", "pendingAmount", "settledAmount", "lastSettlementDate", "nextSettlementDate", "status", "notes")
      VALUES ${reconciliationInserts.join(', ')}
    `);
    
    await queryRunner.release();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Seeded 50 users with related data');
    console.log('📊 Seeded 200 notifications');
    console.log('📊 Seeded 300 coin transactions');
    console.log('📊 And many more records across all tables!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seeding script
if (require.main === module) {
  seedDummyData().catch(console.error);
}

export { seedDummyData };
