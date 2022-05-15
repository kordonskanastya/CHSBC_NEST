import { EventSubscriber } from 'typeorm'
import { User } from './user.entity'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { GetLoggerUserDto } from '../../loggers/dto/get-logger-user.dto'
import { Entities } from '../../common/enums'

@EventSubscriber()
export class UserSubscriber extends LoggerSubscriber<User> {
  listenTo() {
    return User
  }

  getEntityName() {
    return Entities.USERS
  }

  prepareData(data) {
    return plainToClass(GetLoggerUserDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
