import { DATABASE_CONNECTION, GRADE_HISTORY_REPOSITORY } from '../../../constants'
import { Connection } from 'typeorm'
import { GradeHistory } from './grades-history.entity'

export const gradesHistoryProviders = [
  {
    provide: GRADE_HISTORY_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(GradeHistory),
    inject: [DATABASE_CONNECTION],
  },
]
