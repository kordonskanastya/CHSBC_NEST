import { Module } from '@nestjs/common'
import { LoggersService } from './loggers.service'
import { LoggersController } from './loggers.controller'
import { DatabaseModule } from '../../database.module'
import { loggerProviders } from './entities/logger.providers'

@Module({
  imports: [DatabaseModule],
  controllers: [LoggersController],
  providers: [LoggersService, ...loggerProviders],
  exports: [LoggersService, ...loggerProviders],
})
export class LoggersModule {}
