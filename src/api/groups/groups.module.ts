import { forwardRef, Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { DatabaseModule } from '../../database.module'
import { groupProviders } from './entities/groups.providers'
import { AuthModule } from '../../auth/auth.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService, ...groupProviders],
  exports: [GroupsService, ...groupProviders],
})
export class GroupsModule {}
