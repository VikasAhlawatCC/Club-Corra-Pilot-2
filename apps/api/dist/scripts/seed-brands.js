"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const brand_entity_1 = require("../brands/entities/brand.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'clubcorra',
    entities: [brand_entity_1.Brand],
    synchronize: false,
});
async function seedBrands() {
    try {
        await dataSource.initialize();
        console.log('Database connection established');
        const brandRepository = dataSource.getRepository(brand_entity_1.Brand);
        // Check if brands already exist
        const existingBrands = await brandRepository.find();
        if (existingBrands.length > 0) {
            console.log('Brands already exist, skipping seed');
            return;
        }
        // Create brands
        const brands = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Adidas',
                description: 'Adidas is a German multinational corporation, founded and headquartered in Herzogenaurach, Germany, that designs and manufactures shoes, clothing and accessories.',
                logoUrl: 'https://example.com/adidas-logo.png',
                earningPercentage: 5,
                redemptionPercentage: 2,
                minRedemptionAmount: 1,
                maxRedemptionAmount: 2000,
                brandwiseMaxCap: 2000,
                isActive: true,
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Nike',
                description: 'Nike, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services.',
                logoUrl: 'https://example.com/nike-logo.png',
                earningPercentage: 4,
                redemptionPercentage: 2,
                minRedemptionAmount: 1,
                maxRedemptionAmount: 2000,
                brandwiseMaxCap: 2000,
                isActive: true,
            },
        ];
        for (const brandData of brands) {
            const brand = brandRepository.create(brandData);
            await brandRepository.save(brand);
            console.log(`Created brand: ${brand.name}`);
        }
        console.log('Brand seeding completed successfully');
    }
    catch (error) {
        console.error('Error seeding brands:', error);
    }
    finally {
        await dataSource.destroy();
    }
}
seedBrands();
