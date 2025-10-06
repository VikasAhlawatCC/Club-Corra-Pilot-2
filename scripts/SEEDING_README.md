# Database Seeding Guide

This guide explains how to populate your database with dummy data for development and testing purposes.

## Overview

The seeding script populates all database tables with realistic dummy data, except for:
- `admins` table (excluded as requested)
- `brands` table (excluded as requested) 
- `categories` table (excluded as requested)

## What Gets Seeded

The script creates dummy data for the following tables:

### User-related Tables
- **users** (50 records) - User accounts with various statuses
- **user_profiles** - Profile information for each user
- **payment_details** - Payment information for each user
- **auth_providers** - Authentication provider links (SMS, Email, Google, Facebook)

### Coin System
- **coin_balances** - Coin balances for each user
- **coin_transactions** (300 records) - Transaction history with various types

### Notifications & Communication
- **notifications** (200 records) - User notifications of various types
- **waitlist_entries** (30 records) - Waitlist signups
- **partner_applications** (15 records) - Partner application submissions

### Business Data
- **offers** (25 records) - Brand offers (requires existing brands)
- **files** (100 records) - User uploaded files
- **risk_signals** (40 records) - Risk assessment signals

### Admin & System Tables
- **saved_views** (10 records) - Admin saved dashboard views
- **experiment_configs** (8 records) - A/B testing configurations
- **dashboard_metrics_cache** (12 records) - Cached dashboard metrics
- **audit_logs** (80 records) - System audit logs
- **financial_reconciliation** (20 records) - Financial reconciliation records

## Prerequisites

Before running the seeding script, ensure you have:

1. **Database connection configured** - Make sure your database is running and accessible
2. **Existing brands and admins** - The script requires at least one brand and one admin record to create foreign key relationships
3. **Database migrations run** - Ensure all database migrations have been executed

## How to Run

### Option 1: Using the Shell Script (Recommended)

From the project root directory:

```bash
./scripts/seed-dummy-data.sh
```

### Option 2: Manual Execution

Navigate to the API directory and run:

```bash
cd apps/api
npm run seed:dummy
```

### Option 3: Direct TypeScript Execution

```bash
cd apps/api
npx ts-node -r tsconfig-paths/register src/scripts/seed-dummy-data.ts
```

## Configuration

You can modify the number of records created by editing the `DUMMY_DATA_CONFIG` object in `apps/api/src/scripts/seed-dummy-data.ts`:

```typescript
const DUMMY_DATA_CONFIG = {
  users: 50,                    // Number of users to create
  notifications: 200,           // Number of notifications
  coinTransactions: 300,       // Number of coin transactions
  waitlistEntries: 30,         // Number of waitlist entries
  partnerApplications: 15,     // Number of partner applications
  offers: 25,                  // Number of offers
  files: 100,                  // Number of files
  riskSignals: 40,            // Number of risk signals
  savedViews: 10,              // Number of saved views
  experimentConfigs: 8,        // Number of experiment configs
  dashboardMetricsCache: 12,   // Number of cache entries
  auditLogs: 80,               // Number of audit logs
  financialReconciliation: 20, // Number of reconciliation records
};
```

## Data Characteristics

The dummy data includes:

- **Realistic names** - Indian names for users
- **Valid phone numbers** - Indian mobile numbers (+91)
- **Proper email addresses** - Following standard email format
- **Realistic relationships** - Foreign key relationships are properly maintained
- **Varied statuses** - Different statuses for users, transactions, etc.
- **Date ranges** - Realistic date ranges for historical data
- **Random but logical data** - Random but contextually appropriate values

## Troubleshooting

### Common Issues

1. **"No brands found"** - Ensure you have at least one brand in your database
2. **"No admins found"** - Ensure you have at least one admin in your database
3. **Database connection errors** - Check your database configuration in `data-source.ts`
4. **Foreign key constraint errors** - Ensure all required parent records exist

### Database Connection

Make sure your database connection is properly configured in `apps/api/src/data-source.ts` and that the database is running.

### Memory Issues

If you encounter memory issues with large datasets, reduce the numbers in `DUMMY_DATA_CONFIG`.

## Safety Notes

- **This script is for development only** - Never run on production data
- **It will add data to existing tables** - It doesn't clear existing data
- **Foreign key constraints** - The script respects database relationships
- **Idempotent** - You can run it multiple times safely

## Customization

You can customize the dummy data by modifying:

1. **Sample data arrays** - Add more names, companies, etc.
2. **Data generation logic** - Modify how random data is generated
3. **Record counts** - Adjust the number of records created
4. **Data relationships** - Modify how entities are related

## Next Steps

After seeding:

1. **Verify data** - Check your database to ensure data was created correctly
2. **Test your application** - Use the dummy data to test your features
3. **Adjust as needed** - Modify the script if you need different data patterns

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your database connection
3. Ensure all prerequisites are met
4. Check the database logs for constraint violations
