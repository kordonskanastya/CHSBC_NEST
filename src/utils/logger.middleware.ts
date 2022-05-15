import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request
    // const userAgent = request.get('user-agent') || ''

    response.on('finish', () => {
      // const { statusCode } = response
      const contentLength = response.get('content-length')

      if ((request as any).user) {
        this.logger.log(
          // eslint-disable-next-line max-len
          `${method} ${originalUrl} ${contentLength} - ${ip} - user:${(request as any).user.sub} `,
        )
      } else {
        this.logger.log(`${method} ${originalUrl} - ${ip}`)
      }

      if (method !== 'GET') {
        this.logger.debug(request.body)
      }
    })

    next()
  }
}
