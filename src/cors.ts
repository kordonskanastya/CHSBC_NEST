import { INestApplication } from '@nestjs/common'
import { configService } from './config/config.service'

const whitelist = [
  ...configService
    .getCorsWhitelistApi()
    .split(',')
    .map((str) => str.trim()),
  ...configService
    .getCorsWhitelistWeb()
    .split(',')
    .map((str) => str.trim()),
  'http://localhost:4000',
]

export default function setupCORS(app: INestApplication) {
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  })

  // all subdomains
  // app.enableCors({
  //   origin: /^(https:\/\/([^\.]*\.)?example\.com)$/i,
  // });

  // http or https
  // app.enableCors({
  //   origin: /https?:\/\/(([^/]+\.)?example\.com)$/i,
  // });
}
