import { EventSubscriber } from 'typeorm'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { Entities } from '../../common/enums'
import { plainToClass } from 'class-transformer'
import { VotingResult } from './voting-result.entity'
import { GetLoggerVotingResultDto } from '../../loggers/dto/get-logger-voting-result.dto'

@EventSubscriber()
export class VotingResultSubscriber extends LoggerSubscriber<VotingResult> {
  listenTo() {
    return VotingResult
  }

  getEntityName() {
    return Entities.VOTING_RESULT
  }

  prepareData(data) {
    return plainToClass(GetLoggerVotingResultDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
