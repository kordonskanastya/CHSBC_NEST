import { DATABASE_CONNECTION, VOTE_REPOSITORY } from '../../../constants'
import { Connection } from 'typeorm'
import { Vote } from './voting.entity'

export const votingProviders = [
  {
    provide: VOTE_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Vote),
    inject: [DATABASE_CONNECTION],
  },
]
