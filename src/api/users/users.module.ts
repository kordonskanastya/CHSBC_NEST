import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { userProviders } from './entities/user.providers'
import { DatabaseModule } from '../../database.module'
import { AuthModule } from '../../auth/auth.module'
import { StudentsModule } from '../students/students.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule), forwardRef(() => StudentsModule)],
  controllers: [UsersController],
  providers: [UsersService, ...userProviders],
  exports: [UsersService, ...userProviders],
})
export class UsersModule {}
