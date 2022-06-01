import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { Entities } from '../../common/enums'
import { Group } from './group.entity'
import { GetLoggerGroupDto } from '../../loggers/dto/get-logger-group.dto'

@EventSubscriber()
export class GroupSubscriber extends LoggerSubscriber<Group> {
  listenTo() {
    return Group
  }

  getEntityName() {
    return Entities.GROUPS
  }

  prepareData(data) {
    return plainToClass(GetLoggerGroupDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
