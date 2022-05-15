import { APP_GUARD } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

export const roleProviders = [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
]
