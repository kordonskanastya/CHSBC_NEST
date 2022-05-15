import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { configService } from './config/config.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')

const path = configService.getUploadPath() + '/tmp'
const interval = 30 * 60 * 1000 // 30 minutes

@Injectable()
export class TmpFileService {
  private readonly logger = new Logger(TmpFileService.name)

  @Cron('30 * * * * *')
  handleCron() {
    const now = Date.now()

    fs.readdirSync(path).map((file) =>
      fs.stat(path + '/' + file, (err, stats) => {
        if (!err && now - new Date(stats.mtime).getTime() > interval) {
          try {
            fs.unlink(path + '/' + file, (err) => {
              if (err) console.log(err)
            })
          } catch (e) {
            console.log(e)
          }
        }
      }),
    )
  }
}
