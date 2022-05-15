import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  LoggerService,
  HttpServer,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { configService } from './config/config.service'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService, private httpAdapter: HttpServer) {
    super(httpAdapter)
  }

  getRemoteIP(request): string {
    const ip = request.ip as string
    const result = ip.indexOf(':') >= 0 ? ip.substring(ip.lastIndexOf(':') + 1) : ip // just ipv4
    return result.length > 1 ? result : ''
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const IP = this.getRemoteIP(request)

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof BadRequestException) {
      response.status(exception.getStatus()).json(exception.getResponse())
      this.logger.error({
        httpError: true,
        status: exception.getStatus(),
        message: IP ? `(${IP}) ` : '' + exception['message'],
      })
      return
    }

    const result = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    }
    if (exception['message']) {
      result['message'] = exception['message']
    }
    if (!configService.isProduction()) {
      if (exception['query']) {
        result['detail'] = exception['detail']
        result['query'] = exception['query']
        this.logger.error({
          httpError: false,
          message: IP ? `(${IP}) ` : '' + exception['message'] + ' Query: ' + result['query'],
        })
      }
      if (request.method === 'POST') {
        result['body'] = request.body
      }
    }
    this.logger.error({
      httpError: true,
      status: status,
      message: IP ? `(${IP}) ` : '' + exception['message'],
    })
    response.status(status).json(result)
  }
}
