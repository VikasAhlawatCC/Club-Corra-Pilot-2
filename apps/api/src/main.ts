import 'reflect-metadata'
import * as dotenv from 'dotenv'
dotenv.config()
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import * as Sentry from '@sentry/node'
import { Logger } from 'nestjs-pino'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))

  app.setGlobalPrefix('api/v1')

  // Disable ETag to avoid 304 Not Modified responses for JSON APIs
  const httpInstance = app.getHttpAdapter().getInstance()
  if (httpInstance && typeof httpInstance.set === 'function') {
    httpInstance.set('etag', false)
  }

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true })
  )

  app.useGlobalInterceptors(new ResponseInterceptor())

  const allowedOriginRegexes = [
    /\.vercel\.app$/,
    /^https?:\/\/localhost(?::\d+)?$/,
  ]

  const corsEnv = process.env.CORS_ORIGIN || ''
  const corsList = corsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const allowed =
        corsList.includes('*') ||
        corsList.includes(origin) ||
        allowedOriginRegexes.some((re) => re.test(origin))
      return allowed ? callback(null, true) : callback(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
  })

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0,
    })
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3001
  await app.listen(port)
}

bootstrap()
