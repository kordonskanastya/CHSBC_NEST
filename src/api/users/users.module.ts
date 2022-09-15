import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { userProviders } from './entities/user.providers'
import { DatabaseModule } from '../../database.module'
import { AuthModule } from '../../auth/auth.module'
import { GradesModule } from '../grades/grades.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), GradesModule],
  controllers: [UsersController],
  providers: [UsersService, ...userProviders],
  exports: [UsersService, ...userProviders],
})
export class UsersModule {}
