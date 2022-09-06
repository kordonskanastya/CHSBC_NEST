import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { Vote } from './voting.entity'
import { Entities } from '../../common/enums'
import { plainToClass } from 'class-transformer'
import { GetLoggerVotingDto } from '../../loggers/dto/get-logger-voting.dto'

@EventSubscriber()
export class VotingSubscriber extends LoggerSubscriber<Vote> {
  listenTo() {
    return Vote
  }

  getEntityName() {
    return Entities.VOTING
  }

  prepareData(data) {
    return plainToClass(GetLoggerVotingDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
