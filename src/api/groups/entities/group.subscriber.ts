import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { GetLoggerUserDto } from '../../loggers/dto/get-logger-user.dto'
import { Entities } from '../../common/enums'
import { Group } from './group.entity'

@EventSubscriber()
export class GroupSubscriber extends LoggerSubscriber<Group> {
  listenTo() {
    return Group
  }

  getEntityName() {
    return Entities.GROUPS
  }

  prepareData(data) {
    return plainToClass(GetLoggerUserDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
