import 'reflect-metadata'
import * as dotenv from 'dotenv'
dotenv.config()
import { DataSource } from 'typeorm'
import { typeOrmConfig } from '../config/typeorm.config'

async function checkUserBalance() {
  const dataSource = new DataSource(typeOrmConfig)
  
  try {
    await dataSource.initialize()
    console.log('Database connected')
    
    const mobileNumber = '+918397070108'
    
    // Find user
    const userResult = await dataSource.query(`
      SELECT id, "mobileNumber", status FROM users WHERE "mobileNumber" = $1
    `, [mobileNumber])
    
    if (userResult.length === 0) {
      console.log('User not found')
      process.exit(0)
    }
    
    const user = userResult[0]
    console.log('User found:', user)
    
    // Get coin balance
    const balanceResult = await dataSource.query(`
      SELECT balance, total_earned, total_redeemed 
      FROM coin_balances 
      WHERE "userId" = $1
    `, [user.id])
    
    console.log('Balance:', balanceResult)
    
    // Get transactions
    const transactionsResult = await dataSource.query(`
      SELECT id, type, status, coins_earned, coins_redeemed, bill_amount, created_at
      FROM coin_transactions 
      WHERE "userId" = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [user.id])
    
    console.log('Recent transactions:', transactionsResult)
    
    await dataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkUserBalance()

