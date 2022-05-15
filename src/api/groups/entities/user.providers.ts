import { GROUP_REPOSITORY, DATABASE_CONNECTION } from '../../../constants'
import { Connection } from 'typeorm'
import { Group } from './group.entity'

export const groupProviders = [
  {
    provide: GROUP_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Group),
    inject: [DATABASE_CONNECTION],
  },
]
