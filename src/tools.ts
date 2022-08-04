import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common'
import { configService } from './config/config.service'

export default function setupHooks(app: INestApplication) {
  const options: ValidationPipeOptions = {
    transform: false,
    enableDebugMessages: !configService.isProduction(),
    skipUndefinedProperties: false,
    skipNullProperties: true,
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  }
  app.useGlobalPipes(new ValidationPipe(options))
}
