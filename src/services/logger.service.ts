import { LoggerService } from '@nestjs/common'

import * as winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { WinstonModule } from 'nest-winston'
import { utilities as nestWinstonModuleUtilities } from 'nest-winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
}

export class AppLoggerService {
  private static ignoreHttpError = winston.format((info, opts) => {
    if (info.httpError) {
      return false
    }

    return info
  })

  private static onlyHttpError = winston.format((info, opts) => {
    if (info.httpError) {
      return info
    }

    return false
  })

  private static onlyInfoLog = winston.format((info, opts) => {
    const contexts = ['RouterExplorer', 'RoutesResolver', 'InstanceLoader', 'NestFactory']
    if (info.level === 'info' && contexts.indexOf(info.context) === -1) {
      return info
    }

    return false
  })

  public static create(): LoggerService {
    const logger = WinstonModule.createLogger({
      transports: [
        // Console output
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            this.ignoreHttpError(),
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        // Application errors
        new DailyRotateFile({
          level: 'warn',
          filename: 'Cargo-errors-%DATE%.log',
          dirname: 'logs',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            this.ignoreHttpError(),
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.printf(
              ({ level, message, label, timestamp, context }) => `${timestamp}: [${context}] ${message}`,
            ),
          ),
        }),
        // Http errors
        new DailyRotateFile({
          level: 'warn',
          filename: 'Cargo-http-%DATE%.log',
          dirname: 'logs',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            this.onlyHttpError(),
            winston.format.timestamp(),
            winston.format.json(),
            // winston.format.prettyPrint()
          ),
        }),
        // Info logs
        new DailyRotateFile({
          level: 'info',
          filename: 'Cargo-info-%DATE%.log',
          dirname: 'logs',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            this.onlyInfoLog(),
            winston.format.timestamp(),
            winston.format.printf(
              ({ level, message, label, timestamp, context }) => `${timestamp}: [${context}] ${message}`,
            ),
          ),
        }),
      ],
    })

    return logger
  }
}
