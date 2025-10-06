import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'sqlite://:memory:'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRES_IN = '1h'

// Mock external services
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}))

// Global test setup
beforeAll(async () => {
  // Setup any global test configuration
})

afterAll(async () => {
  // Cleanup after all tests
})

// Mock database connection
export const createTestApp = async (modules: any[]): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [],
        synchronize: true,
        logging: false,
      }),
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
      ...modules,
    ],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.setGlobalPrefix('api/v1')
  
  await app.init()
  return app
}

// Mock data factories
export const createMockAdmin = (overrides = {}) => ({
  id: 'admin-1',
  email: 'admin@clubcorra.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  mobileNumber: '+1234567890',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockBrand = (overrides = {}) => ({
  id: 'brand-1',
  name: 'Test Brand',
  description: 'Test brand description',
  logo: 'https://example.com/logo.png',
  website: 'https://brand.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'txn-1',
  userId: 'user-1',
  type: 'EARN',
  amount: 100,
  status: 'PENDING',
  description: 'Test transaction',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Mock JWT token
export const createMockJwtToken = (payload = {}) => {
  const defaultPayload = {
    sub: 'admin-1',
    email: 'admin@clubcorra.com',
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  }
  
  // Simple JWT mock - in real tests, use proper JWT library
  return `mock-jwt-token-${JSON.stringify(defaultPayload)}`
}

// Mock request object
export const createMockRequest = (overrides = {}) => ({
  user: createMockAdmin(),
  headers: {
    authorization: `Bearer ${createMockJwtToken()}`,
  },
  body: {},
  params: {},
  query: {},
  ...overrides,
})

// Mock response object
export const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
})

// Utility functions for tests
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
})
