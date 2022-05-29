import { STUDENT_REPOSITORY, DATABASE_CONNECTION } from '../../../constants'
import { Connection } from 'typeorm'
import { Student } from './student.entity'

export const studentProviders = [
  {
    provide: STUDENT_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Student),
    inject: [DATABASE_CONNECTION],
  },
]
