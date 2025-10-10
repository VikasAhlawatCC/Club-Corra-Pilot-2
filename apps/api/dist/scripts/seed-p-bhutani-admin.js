#!/usr/bin/env ts-node
"use strict";
/**
 * Seed script to create admin user for p.bhutani@clubcorra.com
 * Usage: ts-node src/scripts/seed-p-bhutani-admin.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const bcrypt = __importStar(require("bcryptjs"));
const data_source_1 = require("../data-source");
const admin_entity_1 = require("../admin/entities/admin.entity");
async function seedPBhutaniAdmin() {
    try {
        // Initialize database connection
        console.log('Connecting to database...');
        await data_source_1.AppDataSource.initialize();
        console.log('Database connected!');
        const adminRepository = data_source_1.AppDataSource.getRepository(admin_entity_1.Admin);
        // Check if admin already exists
        const existingAdmin = await adminRepository.findOne({
            where: { email: 'p.bhutani@clubcorra.com' },
        });
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email: p.bhutani@clubcorra.com');
            await data_source_1.AppDataSource.destroy();
            return;
        }
        // Create new admin user
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 10);
        const admin = adminRepository.create({
            email: 'p.bhutani@clubcorra.com',
            passwordHash,
            firstName: 'Pranav',
            lastName: 'Bhutani',
            role: 'SUPER_ADMIN',
            isActive: true,
        });
        await adminRepository.save(admin);
        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    p.bhutani@clubcorra.com');
        console.log('🔐 Password: admin123');
        console.log('👤 Name:     Pranav Bhutani');
        console.log('🔑 Role:     SUPER_ADMIN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change this password after first login!');
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}
seedPBhutaniAdmin();
