#!/usr/bin/env ts-node

import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import { Brand } from '../brands/entities/brand.entity'

// Brands without logo mappings that should be made inactive
const BRANDS_TO_DEACTIVATE = [
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

async function makeBrandsInactive() {
  try {
    console.log('🚀 Starting brand deactivation process...')
    
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const brandRepository = AppDataSource.getRepository(Brand)
    
    let deactivatedCount = 0
    let notFoundCount = 0
    const notFoundBrands: string[] = []
    
    for (const brandName of BRANDS_TO_DEACTIVATE) {
      try {
        const result = await brandRepository.update(
          { name: brandName },
          { isActive: false }
        )
        
        if (result.affected && result.affected > 0) {
          console.log(`✅ Deactivated: ${brandName}`)
          deactivatedCount++
        } else {
          console.log(`⚠️  Brand not found: ${brandName}`)
          notFoundBrands.push(brandName)
          notFoundCount++
        }
      } catch (error) {
        console.error(`❌ Error deactivating ${brandName}:`, error instanceof Error ? error.message : String(error))
      }
    }
    
    console.log('\n📊 Deactivation Summary:')
    console.log(`✅ Successfully deactivated: ${deactivatedCount} brands`)
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
    
    console.log('\n🎉 Brand deactivation completed!')
    console.log('\n💡 To reactivate these brands later, you can:')
    console.log('   1. Run the reactivation script: ./scripts/reactivate-brands.sh')
    console.log('   2. Or manually update isActive to true in the database')
    
  } catch (error) {
    console.error('❌ Error deactivating brands:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

// Run the script
if (require.main === module) {
  makeBrandsInactive().catch(console.error)
}

export { makeBrandsInactive }
