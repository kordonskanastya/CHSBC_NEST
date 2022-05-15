import { LoggerService } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configService } from './config/config.service'
import setupCORS from './cors'
import { AppLoggerService } from './services/logger.service'
import setupSwagger from './swagger'
import setupHooks from './tools'
import { Logger } from 'nestjs-pino'

async function bootstrap() {
  const logger: LoggerService = AppLoggerService.create()
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  app.useLogger(app.get(Logger))
  setupCORS(app)
  // await setupLogger(app, {
  //   cors: false,
  //   logger: logger,
  // })
  setupSwagger(app)
  setupHooks(app)
  await app.listen(configService.getPort())
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()
