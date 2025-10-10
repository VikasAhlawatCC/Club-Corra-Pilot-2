#!/usr/bin/env ts-node

import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import { Brand } from '../brands/entities/brand.entity'

// Brands that were deactivated and can be reactivated
const BRANDS_TO_REACTIVATE = [
  'Lemon Tree Hotels',
  'Minimalist',
  'Wellbeing Nutrition',
  'Agilus Diagnostics',
  'Kaya Skin Clinic',
  'Clove Dental Clinics',
  'CloudNine Hospitals',
  'Healthify',
  'FirstCry',
  'Hopscotch',
  'Philips Avent',
  'The Moms Co',
  'Heads Up For Tails',
  'Supertails',
  'Godrej Interio',
  'Elementry'
]

async function reactivateBrands() {
  try {
    console.log('🚀 Starting brand reactivation process...')
    
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const brandRepository = AppDataSource.getRepository(Brand)
    
    let reactivatedCount = 0
    let notFoundCount = 0
    const notFoundBrands: string[] = []
    
    for (const brandName of BRANDS_TO_REACTIVATE) {
      try {
        const result = await brandRepository.update(
          { name: brandName },
          { isActive: true }
        )
        
        if (result.affected && result.affected > 0) {
          console.log(`✅ Reactivated: ${brandName}`)
          reactivatedCount++
        } else {
          console.log(`⚠️  Brand not found: ${brandName}`)
          notFoundBrands.push(brandName)
          notFoundCount++
        }
      } catch (error) {
        console.error(`❌ Error reactivating ${brandName}:`, error instanceof Error ? error.message : String(error))
      }
    }
    
    console.log('\n📊 Reactivation Summary:')
    console.log(`✅ Successfully reactivated: ${reactivatedCount} brands`)
    console.log(`⚠️  Brands not found: ${notFoundCount} brands`)
    
    if (notFoundBrands.length > 0) {
      console.log('\n🔍 Brands not found in database:')
      notFoundBrands.forEach(name => console.log(`   - ${name}`))
    }
    
    // Show current active brands count
    const activeBrandsCount = await brandRepository.count({ where: { isActive: true } })
    const inactiveBrandsCount = await brandRepository.count({ where: { isActive: false } })
    
    console.log('\n📈 Current Brand Status:')
    console.log(`🟢 Active brands: ${activeBrandsCount}`)
    console.log(`🔴 Inactive brands: ${inactiveBrandsCount}`)
    
    console.log('\n🎉 Brand reactivation completed!')
    
  } catch (error) {
    console.error('❌ Error reactivating brands:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

// Run the script
if (require.main === module) {
  reactivateBrands().catch(console.error)
}

export { reactivateBrands }
