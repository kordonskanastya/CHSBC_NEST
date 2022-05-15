import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { userProviders } from '../users/entities/user.providers'
import { DatabaseModule } from '../../database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService, ...userProviders],
  exports: [GroupsService, ...userProviders],
})
export class GroupsModule {}
