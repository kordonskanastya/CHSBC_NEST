import { SetMetadata } from '@nestjs/common'

export const MinRole = (minRole: string) => SetMetadata('minRole', minRole)
