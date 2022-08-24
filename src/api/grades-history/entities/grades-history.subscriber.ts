import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { Entities } from '../../common/enums'
import { GradeHistory } from './grades-history.entity'
import { GetLoggerGradesHistoryDto } from '../../loggers/dto/get-logger-grades-history.dto'

@EventSubscriber()
export class GradesHistorySubscriber extends LoggerSubscriber<GradeHistory> {
  listenTo() {
    return GradeHistory
  }

  getEntityName() {
    return Entities.GRADES_HISTORY
  }

  prepareData(data) {
    return plainToClass(GetLoggerGradesHistoryDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
