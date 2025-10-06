#!/usr/bin/env ts-node
/**
 * Seed script to create an initial admin user
 * Usage: ts-node src/scripts/seed-admin.ts
 */

import 'reflect-metadata'
import * as bcrypt from 'bcryptjs'
import { AppDataSource } from '../data-source'
import { Admin } from '../admin/entities/admin.entity'

async function seedAdmin() {
  try {
    // Initialize database connection
    console.log('Connecting to database...')
    await AppDataSource.initialize()
    console.log('Database connected!')

    const adminRepository = AppDataSource.getRepository(Admin)

    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({
      where: { email: 'admin@clubcorra.com' },
    })

    if (existingAdmin) {
      console.log('❌ Admin user already exists!')
      console.log('Email: admin@clubcorra.com')
      await AppDataSource.destroy()
      return
    }

    // Create new admin user
    const password = 'Admin123!' // Change this in production!
    const passwordHash = await bcrypt.hash(password, 10)

    const admin = adminRepository.create({
      email: 'admin@clubcorra.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
    })

    await adminRepository.save(admin)

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    admin@clubcorra.com')
    console.log('🔐 Password: Admin123!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  Please change this password after first login!')

    await AppDataSource.destroy()
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()

