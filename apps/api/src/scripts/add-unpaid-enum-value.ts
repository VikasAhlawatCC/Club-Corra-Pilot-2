import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'club_corra',
  synchronize: false,
  logging: true,
});

async function addUnpaidEnumValue() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  try {
    console.log('Checking if UNPAID value exists in coin_transaction_status enum...');
    
    const result = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
      ) as exists
    `);

    if (result[0].exists) {
      console.log('✅ UNPAID value already exists in the enum');
    } else {
      console.log('Adding UNPAID value to the enum...');
      await AppDataSource.query(`
        ALTER TYPE coin_transaction_status ADD VALUE 'UNPAID'
      `);
      console.log('✅ UNPAID value added successfully!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

addUnpaidEnumValue()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

