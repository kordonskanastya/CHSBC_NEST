import { INestApplication, LoggerService, NestApplicationOptions } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { AllExceptionsFilter } from './all-exception.filter'

export default async function setupLogger(app: INestApplication, options: NestApplicationOptions) {
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(options.logger as LoggerService, httpAdapter))
}
