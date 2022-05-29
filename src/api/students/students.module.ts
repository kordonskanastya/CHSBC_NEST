import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { AuthModule } from '../../auth/auth.module'
import { DatabaseModule } from '../../database.module'
import { studentProviders } from './entities/student.providers'
import { GroupsModule } from '../groups/groups.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => GroupsModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, ...studentProviders],
  exports: [StudentsService, ...studentProviders],
})
export class StudentsModule {}
