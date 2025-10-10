#!/usr/bin/env ts-node
/**
 * Seed script to create admin user for p.bhutani@clubcorra.com
 * Usage: ts-node src/scripts/seed-p-bhutani-admin.ts
 */

import 'reflect-metadata'
import * as bcrypt from 'bcryptjs'
import { AppDataSource } from '../data-source'
import { Admin } from '../admin/entities/admin.entity'

async function seedPBhutaniAdmin() {
  try {
    // Initialize database connection
    console.log('Connecting to database...')
    await AppDataSource.initialize()
    console.log('Database connected!')

    const adminRepository = AppDataSource.getRepository(Admin)

    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({
      where: { email: 'p.bhutani@clubcorra.com' },
    })

    if (existingAdmin) {
      console.log('❌ Admin user already exists!')
      console.log('Email: p.bhutani@clubcorra.com')
      await AppDataSource.destroy()
      return
    }

    // Create new admin user
    const password = 'admin123'
    const passwordHash = await bcrypt.hash(password, 10)

    const admin = adminRepository.create({
      email: 'p.bhutani@clubcorra.com',
      passwordHash,
      firstName: 'Pranav',
      lastName: 'Bhutani',
      role: 'SUPER_ADMIN',
      isActive: true,
    })

    await adminRepository.save(admin)

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    p.bhutani@clubcorra.com')
    console.log('🔐 Password: admin123')
    console.log('👤 Name:     Pranav Bhutani')
    console.log('🔑 Role:     SUPER_ADMIN')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  Please change this password after first login!')

    await AppDataSource.destroy()
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  }
}

seedPBhutaniAdmin()
