import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common'
import { configService } from './config/config.service'

export default function setupHooks(app: INestApplication) {
  const options: ValidationPipeOptions = {
    transform: true,
    enableDebugMessages: !configService.isProduction(),
    skipUndefinedProperties: true,
    skipNullProperties: true,
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }
  app.useGlobalPipes(new ValidationPipe(options))
}
