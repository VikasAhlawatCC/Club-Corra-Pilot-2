#!/usr/bin/env ts-node

import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import { Brand } from '../brands/entities/brand.entity'

// Brand logo mapping from webapp brands.ts
const BRAND_LOGO_MAPPING: Record<string, string> = {
  'Zepto': 'https://drive.google.com/uc?export=view&id=1ANAZOUJbd9gneq5ibr66Db7uIzlufST9',
  'Swiggy': 'https://drive.google.com/uc?export=view&id=1piLnN2LYMH6KCSSOqrJMjVqSczRTb5RX',
  'Myntra': 'https://drive.google.com/uc?export=view&id=1Qxjqu1NOqDYmY1whqAQK-ZC1OWAaRCYJ',
  'Rapido': 'https://drive.google.com/uc?export=view&id=1PPa_Cot4wD79lmjG8os5ZbDTcIgwR-ZO',
  'Nykaa': 'https://drive.google.com/uc?export=view&id=1JA8hdUH7fAcZp1v1fCrE8DFOXJ5nK9AN',
  'McDonalds': 'https://drive.google.com/uc?export=view&id=1Ad4oNZN0NWqaBKtRMYKQbDsscxByoaJG',
  'Native by UC': 'https://drive.google.com/uc?export=view&id=1SrEZRQt-oO4cJJtaS-YVt6zIroMU9KCF',
  'Dominos': 'https://drive.google.com/uc?export=view&id=1nUm4VpVTKAkPJVVViqiSRfsjN0Ij6kHA',
  'Ixigo': 'https://drive.google.com/uc?export=view&id=1YaKHJLeaS2MUDSw-iQd8wmEiDI_Wb1rI',
  'PVR INOX': 'https://drive.google.com/uc?export=view&id=1o88F_cowDFns0Pch1bp_1VSMuxi-tsnd',
  'Chaayos': 'https://drive.google.com/uc?export=view&id=1H79rNEK1_48IV2MCXDh4wajiopDXjfTi',
  'Decathlon': 'https://drive.google.com/uc?export=view&id=1xD1PL--p6jJPM90TqTWmvqp7x2D_diOn',
  'Blue Tokai': 'https://drive.google.com/uc?export=view&id=1vusw52qIqa3uXqWVQbtB10uyDLSRz17y',
  'Looks Salon': 'https://drive.google.com/uc?export=view&id=1tkK7Gsx418eZlxzBXStyjlhdnc1IA2_9',
  'PharmEasy': 'https://drive.google.com/uc?export=view&id=15ay_7oYCCkCqVBREWKWHu0d9CSV7VVaS',
  'BOAT': 'https://drive.google.com/uc?export=view&id=16Xs1t4cRVo9Hm6FEhCTzyW2PnXeop3HF',
  'RedBus': 'https://drive.google.com/uc?export=view&id=14jLVXtNcWJcSPx4Cz6IMvKDQBj2GRrMG',
  'GIVA': 'https://drive.google.com/uc?export=view&id=1Af524OukTX__JvbftIHc4rY6X-RmlkNt',
  'EatFit Club': 'https://drive.google.com/uc?export=view&id=1Jtu9GaGG5X2VylU4QrtAgWhyMwOs3IIn',
  'Mokobara': 'https://drive.google.com/uc?export=view&id=1ge9empE4AWfp9-T6i8eivi3wrA3D9Ns7',
  'The Whole Truth': 'https://drive.google.com/uc?export=view&id=164ltA2aOgUQ9BBcgAtF-UpvuY0Cd_9mA',
  'Lifestyle': 'https://drive.google.com/uc?export=view&id=1J7Uw_xrro18PcT8qF-NYwAh3tD7u0fYP',
  'Bblunt': 'https://drive.google.com/uc?export=view&id=1bOwb2EOl31hpB6GVz11UDfZcNVNcEZz4',
  'Shuttl': 'https://drive.google.com/uc?export=view&id=137HcbLOWoVbHK6eEKi2S__3q7dd9xQEY',
  'Vijay Sales': 'https://drive.google.com/uc?export=view&id=1KzHrVCQLoLxdRI8zUdGOU0T_WswXJHyW',
  'D\'Decor': 'https://drive.google.com/uc?export=view&id=14DqJkQDdQsze3JpKZJS7Vxtnu1_tGEsI',
  'The Man Company': 'https://drive.google.com/uc?export=view&id=1G0Ak9HBNetWt74aEgs7BJ0sqpaQIKMXv',
  'The Good Bug': 'https://drive.google.com/uc?export=view&id=1JgloPB6E1K9elZTf5p1LqknxVDc_V4sV',
  'MyMuse': 'https://drive.google.com/uc?export=view&id=1qvmKp3Ng5DLFbST52TZ_PS3xpe_PHx9x',
  'Oziva': 'https://drive.google.com/uc?export=view&id=1M3IwR98z9p1iQ71yRgRHSkz1-1aGLgMB',
  // Alternative name mappings for potential variations
  'PVR': 'https://drive.google.com/uc?export=view&id=1o88F_cowDFns0Pch1bp_1VSMuxi-tsnd',
  'Blue Tokai Coffee': 'https://drive.google.com/uc?export=view&id=1vusw52qIqa3uXqWVQbtB10uyDLSRz17y',
  'EatFit': 'https://drive.google.com/uc?export=view&id=1Jtu9GaGG5X2VylU4QrtAgWhyMwOs3IIn',
  'TWT': 'https://drive.google.com/uc?export=view&id=164ltA2aOgUQ9BBcgAtF-UpvuY0Cd_9mA',
  'TMC': 'https://drive.google.com/uc?export=view&id=1G0Ak9HBNetWt74aEgs7BJ0sqpaQIKMXv',
  'TGB': 'https://drive.google.com/uc?export=view&id=1JgloPB6E1K9elZTf5p1LqknxVDc_V4sV',
  
  // Case sensitivity fixes and additional brands from webapp
  'BBlunt': 'https://drive.google.com/uc?export=view&id=1bOwb2EOl31hpB6GVz11UDfZcNVNcEZz4', // Database has BBlunt, webapp has Bblunt
  'Nature\'s Basket': 'https://drive.google.com/uc?export=view&id=1rMOZPtxZAJLS1RoaWT9eH9IC_k-ANqu7', // Commented out in webapp but exists in DB
}

async function updateBrandLogos() {
  try {
    console.log('🚀 Starting brand logo update...')
    
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const brandRepository = AppDataSource.getRepository(Brand)
    
    // Get all brands from database
    const brands = await brandRepository.find()
    console.log(`📊 Found ${brands.length} brands in database`)
    
    let updatedCount = 0
    let notFoundCount = 0
    const notFoundBrands: string[] = []
    
    for (const brand of brands) {
      const logoUrl = BRAND_LOGO_MAPPING[brand.name]
      
      if (logoUrl) {
        // Update the brand with the correct logo URL
        await brandRepository.update(brand.id, { logoUrl })
        console.log(`✅ Updated ${brand.name} logo`)
        updatedCount++
      } else {
        console.log(`⚠️  No logo mapping found for: ${brand.name}`)
        notFoundBrands.push(brand.name)
        notFoundCount++
      }
    }
    
    console.log('\n📊 Update Summary:')
    console.log(`✅ Successfully updated: ${updatedCount} brands`)
    console.log(`⚠️  No mapping found: ${notFoundCount} brands`)
    
    if (notFoundBrands.length > 0) {
      console.log('\n🔍 Brands without logo mappings:')
      notFoundBrands.forEach(name => console.log(`   - ${name}`))
      console.log('\n💡 You may need to:')
      console.log('   1. Check if brand names match exactly')
      console.log('   2. Add new mappings to BRAND_LOGO_MAPPING')
      console.log('   3. Update brand names in database to match webapp')
    }
    
    console.log('\n🎉 Brand logo update completed!')
    
  } catch (error) {
    console.error('❌ Error updating brand logos:', error instanceof Error ? error.message : String(error))
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

// Run the script
if (require.main === module) {
  updateBrandLogos().catch(console.error)
}

export { updateBrandLogos }
