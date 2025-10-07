import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function addUnpaidEnumValue() {
  console.log('🚀 Starting script to add UNPAID enum value...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('📊 Checking if UNPAID value exists in coin_transaction_status enum...');
    
    const result = await dataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
      ) as exists
    `);

    if (result[0].exists) {
      console.log('✅ UNPAID value already exists in the enum');
    } else {
      console.log('➕ Adding UNPAID value to the enum...');
      await dataSource.query(`
        ALTER TYPE coin_transaction_status ADD VALUE 'UNPAID'
      `);
      console.log('✅ UNPAID value added successfully!');
    }

    console.log('\n📋 Current enum values:');
    const enumValues = await dataSource.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
      ORDER BY enumsortorder
    `);
    enumValues.forEach((row: any) => console.log(`  - ${row.enumlabel}`));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await app.close();
    console.log('\n✅ Script completed!');
  }
}

addUnpaidEnumValue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

