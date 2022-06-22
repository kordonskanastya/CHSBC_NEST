import { Module } from '@nestjs/common'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { DatabaseModule } from '../../database.module'
import { studentProviders } from './entities/student.providers'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [StudentsController],
  providers: [StudentsService, ...studentProviders],
  exports: [StudentsService, ...studentProviders],
})
export class StudentsModule {}
