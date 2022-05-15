import { createConnection } from 'typeorm'
import { configService } from './config/config.service'
import { DATABASE_CONNECTION } from './constants'

const options = configService.getTypeOrmConfig()
export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async () => await createConnection(options),
  },
]
