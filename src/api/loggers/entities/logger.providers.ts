import { LOGGER_REPOSITORY, DATABASE_CONNECTION } from '../../../constants'
import { Connection } from 'typeorm'
import { Logger } from './logger.entity'

export const loggerProviders = [
  {
    provide: LOGGER_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Logger),
    inject: [DATABASE_CONNECTION],
  },
]
