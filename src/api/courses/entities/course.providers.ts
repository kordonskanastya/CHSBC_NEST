import { COURSE_REPOSITORY, DATABASE_CONNECTION } from '../../../constants'
import { Connection } from 'typeorm'
import { Course } from './course.entity'

export const courseProviders = [
  {
    provide: COURSE_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Course),
    inject: [DATABASE_CONNECTION],
  },
]
