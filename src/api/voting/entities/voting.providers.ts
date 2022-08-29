import { DATABASE_CONNECTION, VOTE_REPOSITORY, VOTE_RESULT_REPOSITORY } from '../../../constants'
import { Connection } from 'typeorm'
import { Vote } from './voting.entity'
import { VotingResult } from './voting-result.entity'

export const votingProviders = [
  {
    provide: VOTE_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Vote),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: VOTE_RESULT_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(VotingResult),
    inject: [DATABASE_CONNECTION],
  },
]
