#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedComprehensiveBrands = seedComprehensiveBrands;
require("reflect-metadata");
const data_source_1 = require("../data-source");
const brand_entity_1 = require("../brands/entities/brand.entity");
// Comprehensive brand data from webapp brands.ts
const COMPREHENSIVE_BRANDS = [
    {
        name: 'Zepto',
        description: 'Zepto is India\'s fastest-growing quick commerce platform, delivering groceries and essentials in minutes.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1ANAZOUJbd9gneq5ibr66Db7uIzlufST9',
        earningPercentage: 15,
        redemptionPercentage: 10,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Swiggy',
        description: 'Swiggy is India\'s leading food delivery platform, connecting customers with restaurants.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1piLnN2LYMH6KCSSOqrJMjVqSczRTb5RX',
        earningPercentage: 20,
        redemptionPercentage: 15,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Myntra',
        description: 'Myntra is India\'s leading fashion e-commerce platform offering clothing, footwear, and accessories.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1Qxjqu1NOqDYmY1whqAQK-ZC1OWAaRCYJ',
        earningPercentage: 25,
        redemptionPercentage: 20,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Rapido',
        description: 'Rapido is India\'s largest bike taxi service, providing quick and affordable rides.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1PPa_Cot4wD79lmjG8os5ZbDTcIgwR-ZO',
        earningPercentage: 10,
        redemptionPercentage: 8,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Nykaa',
        description: 'Nykaa is India\'s leading beauty and wellness platform offering cosmetics, skincare, and personal care products.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1JA8hdUH7fAcZp1v1fCrE8DFOXJ5nK9AN',
        earningPercentage: 30,
        redemptionPercentage: 25,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'McDonalds',
        description: 'McDonald\'s is a global fast-food restaurant chain serving burgers, fries, and beverages.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1Ad4oNZN0NWqaBKtRMYKQbDsscxByoaJG',
        earningPercentage: 12,
        redemptionPercentage: 10,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Native by UC',
        description: 'Native by UC is a premium personal care brand offering natural and organic products.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1SrEZRQt-oO4cJJtaS-YVt6zIroMU9KCF',
        earningPercentage: 18,
        redemptionPercentage: 15,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Dominos',
        description: 'Domino\'s Pizza is a global pizza delivery and restaurant chain.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1nUm4VpVTKAkPJVVViqiSRfsjN0Ij6kHA',
        earningPercentage: 22,
        redemptionPercentage: 18,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Ixigo',
        description: 'Ixigo is a travel booking platform offering flights, trains, buses, and hotels.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1YaKHJLeaS2MUDSw-iQd8wmEiDI_Wb1rI',
        earningPercentage: 8,
        redemptionPercentage: 6,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'PVR INOX',
        description: 'PVR INOX is India\'s largest multiplex chain offering cinema entertainment.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1o88F_cowDFns0Pch1bp_1VSMuxi-tsnd',
        earningPercentage: 35,
        redemptionPercentage: 30,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Chaayos',
        description: 'Chaayos is a premium tea cafe chain offering authentic chai and snacks.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1H79rNEK1_48IV2MCXDh4wajiopDXjfTi',
        earningPercentage: 14,
        redemptionPercentage: 12,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Decathlon',
        description: 'Decathlon is a global sports retailer offering equipment and apparel for various sports.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1xD1PL--p6jJPM90TqTWmvqp7x2D_diOn',
        earningPercentage: 28,
        redemptionPercentage: 25,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Blue Tokai',
        description: 'Blue Tokai Coffee Roasters is a specialty coffee brand offering premium coffee beans and beverages.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1vusw52qIqa3uXqWVQbtB10uyDLSRz17y',
        earningPercentage: 16,
        redemptionPercentage: 14,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Looks Salon',
        description: 'Looks Salon is a premium beauty and wellness chain offering hair, skin, and beauty services.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1tkK7Gsx418eZlxzBXStyjlhdnc1IA2_9',
        earningPercentage: 40,
        redemptionPercentage: 35,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'PharmEasy',
        description: 'PharmEasy is India\'s leading online pharmacy platform offering medicines and healthcare products.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=15ay_7oYCCkCqVBREWKWHu0d9CSV7VVaS',
        earningPercentage: 13,
        redemptionPercentage: 11,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'BOAT',
        description: 'boAt is India\'s leading audio and wearable brand offering headphones, speakers, and smartwatches.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=16Xs1t4cRVo9Hm6FEhCTzyW2PnXeop3HF',
        earningPercentage: 24,
        redemptionPercentage: 20,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'RedBus',
        description: 'RedBus is India\'s largest bus ticketing platform offering intercity and intracity bus bookings.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=14jLVXtNcWJcSPx4Cz6IMvKDQBj2GRrMG',
        earningPercentage: 11,
        redemptionPercentage: 9,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'GIVA',
        description: 'GIVA is a premium jewelry brand offering fine jewelry and accessories.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1Af524OukTX__JvbftIHc4rY6X-RmlkNt',
        earningPercentage: 32,
        redemptionPercentage: 28,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'EatFit Club',
        description: 'EatFit Club is a healthy food delivery platform offering nutritious meals and snacks.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1Jtu9GaGG5X2VylU4QrtAgWhyMwOs3IIn',
        earningPercentage: 19,
        redemptionPercentage: 16,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Mokobara',
        description: 'Mokobara is a premium luggage and travel accessories brand.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1ge9empE4AWfp9-T6i8eivi3wrA3D9Ns7',
        earningPercentage: 26,
        redemptionPercentage: 22,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'The Whole Truth',
        description: 'The Whole Truth is a transparent food brand offering honest, clean-label snacks and foods.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=164ltA2aOgUQ9BBcgAtF-UpvuY0Cd_9mA',
        earningPercentage: 17,
        redemptionPercentage: 14,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Lifestyle',
        description: 'Lifestyle is a leading fashion retail chain offering clothing, footwear, and accessories.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1J7Uw_xrro18PcT8qF-NYwAh3tD7u0fYP',
        earningPercentage: 23,
        redemptionPercentage: 19,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Bblunt',
        description: 'Bblunt is a premium hair care brand offering salon-quality hair products.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1bOwb2EOl31hpB6GVz11UDfZcNVNcEZz4',
        earningPercentage: 21,
        redemptionPercentage: 18,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Shuttl',
        description: 'Shuttl is a bus aggregator platform offering daily commute services.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=137HcbLOWoVbHK6eEKi2S__3q7dd9xQEY',
        earningPercentage: 9,
        redemptionPercentage: 7,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Vijay Sales',
        description: 'Vijay Sales is a leading electronics and appliances retail chain.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1KzHrVCQLoLxdRI8zUdGOU0T_WswXJHyW',
        earningPercentage: 27,
        redemptionPercentage: 24,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'D\'Decor',
        description: 'D\'Decor is a premium home decor and furnishings brand.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=14DqJkQDdQsze3JpKZJS7Vxtnu1_tGEsI',
        earningPercentage: 33,
        redemptionPercentage: 29,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'The Man Company',
        description: 'The Man Company is a premium men\'s grooming and personal care brand.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1G0Ak9HBNetWt74aEgs7BJ0sqpaQIKMXv',
        earningPercentage: 29,
        redemptionPercentage: 26,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'The Good Bug',
        description: 'The Good Bug is a sustainable and eco-friendly food brand.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1JgloPB6E1K9elZTf5p1LqknxVDc_V4sV',
        earningPercentage: 31,
        redemptionPercentage: 27,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'MyMuse',
        description: 'MyMuse is a premium intimate wellness and personal care brand.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1qvmKp3Ng5DLFbST52TZ_PS3xpe_PHx9x',
        earningPercentage: 36,
        redemptionPercentage: 32,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
    {
        name: 'Oziva',
        description: 'Oziva is a plant-based nutrition and wellness brand offering protein and supplements.',
        logoUrl: 'https://drive.google.com/uc?export=view&id=1M3IwR98z9p1iQ71yRgRHSkz1-1aGLgMB',
        earningPercentage: 34,
        redemptionPercentage: 30,
        minRedemptionAmount: 1,
        maxRedemptionAmount: 2000,
        brandwiseMaxCap: 2000,
        isActive: true,
    },
];
async function seedComprehensiveBrands() {
    try {
        console.log('🚀 Starting comprehensive brand seeding...');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        const brandRepository = data_source_1.AppDataSource.getRepository(brand_entity_1.Brand);
        // Check existing brands
        const existingBrands = await brandRepository.find();
        console.log(`📊 Found ${existingBrands.length} existing brands`);
        let createdCount = 0;
        let skippedCount = 0;
        const existingBrandNames = existingBrands.map(b => b.name.toLowerCase());
        for (const brandData of COMPREHENSIVE_BRANDS) {
            const brandNameLower = brandData.name.toLowerCase();
            if (existingBrandNames.includes(brandNameLower)) {
                console.log(`⏭️  Skipping ${brandData.name} (already exists)`);
                skippedCount++;
                continue;
            }
            try {
                const brand = brandRepository.create(brandData);
                await brandRepository.save(brand);
                console.log(`✅ Created brand: ${brandData.name}`);
                createdCount++;
            }
            catch (error) {
                console.error(`❌ Error creating brand ${brandData.name}:`, error instanceof Error ? error.message : String(error));
            }
        }
        console.log('\n📊 Seeding Summary:');
        console.log(`✅ Successfully created: ${createdCount} brands`);
        console.log(`⏭️  Skipped (already exist): ${skippedCount} brands`);
        console.log(`📋 Total brands processed: ${COMPREHENSIVE_BRANDS.length}`);
        console.log('\n🎉 Comprehensive brand seeding completed!');
    }
    catch (error) {
        console.error('❌ Error seeding brands:', error);
        throw error;
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
// Run the script
if (require.main === module) {
    seedComprehensiveBrands().catch(console.error);
}
