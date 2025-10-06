#!/usr/bin/env ts-node
"use strict";
/**
 * Seed script to populate brands and brand categories
 * Usage: ts-node src/scripts/seed-brands.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const brand_entity_1 = require("../brands/entities/brand.entity");
const brand_category_entity_1 = require("../brands/entities/brand-category.entity");
// Brand data from the user's request
const brandData = [
    { category: 'Daily Needs', name: 'Zepto', earnRate: 7.5, burnCap: 10 },
    { category: 'Daily Needs', name: "Nature's Basket", earnRate: 7.5, burnCap: 100 },
    { category: 'Fashion & Sports', name: 'Myntra', earnRate: 7.5, burnCap: 100 },
    { category: 'Fashion & Sports', name: 'Lifestyle', earnRate: 7.5, burnCap: 100 },
    { category: 'Fashion & Sports', name: 'Decathlon', earnRate: 7.5, burnCap: 100 },
    { category: 'Mobility & Travel', name: 'Rapido', earnRate: 2.5, burnCap: 10 },
    { category: 'Mobility & Travel', name: 'RedBus', earnRate: 5.0, burnCap: 100 },
    { category: 'Mobility & Travel', name: 'Shuttl', earnRate: 5.0, burnCap: 100 },
    { category: 'Mobility & Travel', name: 'Ixigo', earnRate: 5.0, burnCap: 100 },
    { category: 'Mobility & Travel', name: 'Lemon Tree Hotels', earnRate: 7.5, burnCap: 100 },
    { category: 'Mobility & Travel', name: 'Mokobara', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'Swiggy', earnRate: 2.5, burnCap: 10 },
    { category: 'Food, Dining & Going Out', name: 'Blue Tokai', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'Chaayos', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'McDonalds', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'Dominos', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'EatFit Club', earnRate: 7.5, burnCap: 100 },
    { category: 'Food, Dining & Going Out', name: 'PVR INOX', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'GIVA', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'Nykaa', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'The Whole Truth', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'Minimalist', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'BBlunt', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'Wellbeing Nutrition', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'Oziva', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'The Man Company', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'MyMuse', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'The Good Bug', earnRate: 7.5, burnCap: 100 },
    { category: 'Self-Care', name: 'BOAT', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'PharmEasy', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'Agilus Diagnostics', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'Looks Salon', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'Kaya Skin Clinic', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'Clove Dental Clinics', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'CloudNine Hospitals', earnRate: 7.5, burnCap: 100 },
    { category: 'Health & Fitness', name: 'Healthify', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'FirstCry', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'Hopscotch', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'Philips Avent', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'The Moms Co', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'Heads Up For Tails', earnRate: 7.5, burnCap: 100 },
    { category: 'Child & Pet Care', name: 'Supertails', earnRate: 7.5, burnCap: 100 },
    { category: 'Home Improvement', name: 'Godrej Interio', earnRate: 5.0, burnCap: 100 },
    { category: 'Home Improvement', name: "D'Decor", earnRate: 7.5, burnCap: 100 },
    { category: 'Home Improvement', name: 'Native by UC', earnRate: 5.0, burnCap: 100 },
    { category: 'Home Improvement', name: 'Elementry', earnRate: 7.5, burnCap: 100 },
    { category: 'Home Improvement', name: 'Vijay Sales', earnRate: 5.0, burnCap: 100 },
];
// Category data with descriptions and colors
const categoryData = [
    { name: 'Daily Needs', description: 'Essential daily products and services', color: '#3B82F6', icon: '🛒' },
    { name: 'Fashion & Sports', description: 'Clothing, accessories, and sports equipment', color: '#EF4444', icon: '👕' },
    { name: 'Mobility & Travel', description: 'Transportation and travel services', color: '#10B981', icon: '🚗' },
    { name: 'Food, Dining & Going Out', description: 'Food delivery, restaurants, and entertainment', color: '#F59E0B', icon: '🍽️' },
    { name: 'Self-Care', description: 'Beauty, wellness, and personal care products', color: '#8B5CF6', icon: '💄' },
    { name: 'Health & Fitness', description: 'Healthcare, fitness, and wellness services', color: '#06B6D4', icon: '🏥' },
    { name: 'Child & Pet Care', description: 'Products and services for children and pets', color: '#EC4899', icon: '👶' },
    { name: 'Home Improvement', description: 'Furniture, home decor, and improvement services', color: '#84CC16', icon: '🏠' },
];
async function seedBrands() {
    try {
        // Initialize database connection
        console.log('Connecting to database...');
        await data_source_1.AppDataSource.initialize();
        console.log('Database connected!');
        const brandRepository = data_source_1.AppDataSource.getRepository(brand_entity_1.Brand);
        const categoryRepository = data_source_1.AppDataSource.getRepository(brand_category_entity_1.BrandCategory);
        // First, create or update categories
        console.log('Creating/updating brand categories...');
        const categoryMap = new Map();
        for (const categoryInfo of categoryData) {
            let category = await categoryRepository.findOne({
                where: { name: categoryInfo.name },
            });
            if (!category) {
                category = categoryRepository.create({
                    name: categoryInfo.name,
                    description: categoryInfo.description,
                    color: categoryInfo.color,
                    icon: categoryInfo.icon,
                });
                await categoryRepository.save(category);
                console.log(`✅ Created category: ${categoryInfo.name}`);
            }
            else {
                console.log(`ℹ️  Category already exists: ${categoryInfo.name}`);
            }
            categoryMap.set(categoryInfo.name, category.id);
        }
        // Now create brands
        console.log('\nCreating brands...');
        let createdCount = 0;
        let skippedCount = 0;
        for (const brandInfo of brandData) {
            // Check if brand already exists
            const existingBrand = await brandRepository.findOne({
                where: { name: brandInfo.name },
            });
            if (existingBrand) {
                console.log(`ℹ️  Brand already exists: ${brandInfo.name}`);
                skippedCount++;
                continue;
            }
            const categoryId = categoryMap.get(brandInfo.category);
            if (!categoryId) {
                console.log(`❌ Category not found for brand: ${brandInfo.name}`);
                continue;
            }
            // Create brand with dummy values for missing fields
            const brand = brandRepository.create({
                name: brandInfo.name,
                description: `Premium ${brandInfo.name} experience with exclusive rewards`,
                logoUrl: `https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=${encodeURIComponent(brandInfo.name)}`,
                categoryId: categoryId,
                earningPercentage: brandInfo.earnRate,
                redemptionPercentage: brandInfo.burnCap,
                minRedemptionAmount: 1,
                maxRedemptionAmount: 2000,
                brandwiseMaxCap: 2000,
                isActive: true,
            });
            await brandRepository.save(brand);
            console.log(`✅ Created brand: ${brandInfo.name} (${brandInfo.category})`);
            createdCount++;
        }
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Summary:`);
        console.log(`   Categories: ${categoryData.length}`);
        console.log(`   Brands created: ${createdCount}`);
        console.log(`   Brands skipped: ${skippedCount}`);
        console.log(`   Total brands: ${brandData.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error seeding brands:', error);
        process.exit(1);
    }
}
seedBrands();
