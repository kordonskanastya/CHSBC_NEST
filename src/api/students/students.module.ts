import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { DatabaseModule } from '../../database.module'
import { studentProviders } from './entities/student.providers'
import { GroupsModule } from '../groups/groups.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => UsersModule), GroupsModule],
  controllers: [StudentsController],
  providers: [StudentsService, ...studentProviders],
  exports: [StudentsService, ...studentProviders],
})
export class StudentsModule {}
