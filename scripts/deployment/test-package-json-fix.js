#!/usr/bin/env node

/**
 * Test script to verify package.json path fix
 * This script tests if the @club-corra/shared dependency path is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing package.json path fix...');

// Read the current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
console.log('📁 Package.json path:', packageJsonPath);

if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
}

try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ Package.json loaded successfully');
    
    // Check for @club-corra/shared dependency
    const sharedDep = packageJson.dependencies?.['@club-corra/shared'];
    if (sharedDep) {
        console.log('✅ @club-corra/shared dependency found:', sharedDep);
        
        // Check if the path is correct for production
        if (sharedDep.startsWith('file:./packages/shared')) {
            console.log('✅ Path is correct for production: ./packages/shared');
            
            // Check if the directory exists
            const sharedPath = path.join(process.cwd(), 'packages', 'shared');
            if (fs.existsSync(sharedPath)) {
                console.log('✅ packages/shared directory exists');
                
                // Check if dist/index.js exists
                const distPath = path.join(sharedPath, 'dist', 'index.js');
                if (fs.existsSync(distPath)) {
                    console.log('✅ dist/index.js exists');
                    
                    // Check if package.json exists in shared package
                    const sharedPackageJsonPath = path.join(sharedPath, 'package.json');
                    if (fs.existsSync(sharedPackageJsonPath)) {
                        console.log('✅ Shared package package.json exists');
                        
                        try {
                            const sharedPackageJson = JSON.parse(fs.readFileSync(sharedPackageJsonPath, 'utf8'));
                            console.log('✅ Shared package package.json loaded');
                            
                            // Check for crypto-js dependency
                            if (sharedPackageJson.dependencies?.['crypto-js']) {
                                console.log('✅ crypto-js dependency found in shared package');
                            } else {
                                console.log('⚠️ crypto-js dependency not found in shared package');
                            }
                            
                            // Check for zod dependency
                            if (sharedPackageJson.dependencies?.['zod']) {
                                console.log('✅ zod dependency found in shared package');
                            } else {
                                console.log('⚠️ zod dependency not found in shared package');
                            }
                            
                        } catch (error) {
                            console.error('❌ Failed to parse shared package.json:', error.message);
                        }
                    } else {
                        console.log('⚠️ Shared package package.json not found');
                    }
                } else {
                    console.log('⚠️ dist/index.js not found - package may not be built');
                }
            } else {
                console.log('❌ packages/shared directory not found');
            }
        } else {
            console.log('⚠️ Path may not be correct for production:', sharedDep);
            console.log('💡 Expected: file:./packages/shared');
        }
    } else {
        console.log('❌ @club-corra/shared dependency not found');
    }
    
    // Check for other key dependencies
    const keyDeps = ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express'];
    keyDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep]) {
            console.log(`✅ ${dep} dependency found`);
        } else {
            console.log(`❌ ${dep} dependency not found`);
        }
    });
    
} catch (error) {
    console.error('❌ Failed to parse package.json:', error.message);
    process.exit(1);
}

console.log('\n🎉 Package.json test completed!');
