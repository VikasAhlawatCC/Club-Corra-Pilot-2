import { DataSource } from 'typeorm'
import { typeOrmConfig } from '../config/typeorm.config'
import { PendingTransaction } from '../coins/entities/pending-transaction.entity'
import { LessThan } from 'typeorm'

/**
 * Script to clean up expired and old pending transactions
 * Run this periodically via cron job (e.g., daily)
 * 
 * Usage:
 * npx ts-node src/scripts/cleanup-pending-transactions.ts
 */
async function cleanupPendingTransactions() {
  console.log('Starting pending transactions cleanup...')
  
  const dataSource = new DataSource(typeOrmConfig)
  
  try {
    await dataSource.initialize()
    console.log('Database connection established')
    
    const pendingTransactionRepo = dataSource.getRepository(PendingTransaction)
    
    // 1. Delete expired pending transactions (older than 24 hours)
    const expiredResult = await pendingTransactionRepo.delete({
      expiresAt: LessThan(new Date())
    })
    console.log(`Deleted ${expiredResult.affected || 0} expired pending transactions`)
    
    // 2. Delete claimed pending transactions older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const claimedResult = await pendingTransactionRepo.delete({
      claimed: true,
      claimedAt: LessThan(sevenDaysAgo)
    })
    console.log(`Deleted ${claimedResult.affected || 0} old claimed pending transactions`)
    
    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('Database connection closed')
    }
  }
}

// Run the cleanup
cleanupPendingTransactions()
  .then(() => {
    console.log('Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

