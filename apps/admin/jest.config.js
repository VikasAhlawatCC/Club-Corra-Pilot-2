const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Map admin aliases - order matters! More specific rules first
    '^@/types$': '<rootDir>/src/types',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock specific components that have issues
    '^.*/TransactionVerificationModal$': '<rootDir>/test/__mocks__/TransactionVerificationModal.tsx',
    // Mock external dependencies - order matters! More specific rules first
    '^@heroicons/react/(.*)$': '<rootDir>/test/__mocks__/heroicons.ts',
    '^@radix-ui/react-label$': '<rootDir>/test/__mocks__/radix-label.ts',
    '^@radix-ui/react-select$': '<rootDir>/test/__mocks__/radix-select.ts',
    '^@radix-ui/react-dialog$': '<rootDir>/test/__mocks__/radix-dialog.ts',
    '^@radix-ui/react-dropdown-menu$': '<rootDir>/test/__mocks__/radix-dropdown-menu.ts',
    '^@radix-ui/react-(.*)$': '<rootDir>/test/__mocks__/radix-ui.ts',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // React 19 specific configuration
  testEnvironmentOptions: {
    customExportConditions: ['react', 'next'],
  },
  // Ensure proper React version resolution
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Handle React 19 hooks properly
  transformIgnorePatterns: [
    'node_modules/(?!(react|react-dom|@radix-ui|@heroicons)/)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
