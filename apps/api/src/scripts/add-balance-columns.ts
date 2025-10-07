import 'reflect-metadata'
import * as dotenv from 'dotenv'
dotenv.config()
import { DataSource } from 'typeorm'
import { typeOrmConfig } from '../config/typeorm.config'

async function addBalanceColumns() {
  const dataSource = new DataSource(typeOrmConfig)
  
  try {
    await dataSource.initialize()
    console.log('Database connected')
    
    const queryRunner = dataSource.createQueryRunner()
    
    // Add total_earned and total_redeemed columns if they don't exist
    await queryRunner.query(`
      ALTER TABLE coin_balances 
      ADD COLUMN IF NOT EXISTS total_earned BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_redeemed BIGINT NOT NULL DEFAULT 0
    `)
    
    console.log('Successfully added total_earned and total_redeemed columns to coin_balances table')
    
    await queryRunner.release()
    await dataSource.destroy()
    
    console.log('Done!')
    process.exit(0)
  } catch (error) {
    console.error('Error adding columns:', error)
    process.exit(1)
  }
}

addBalanceColumns()

