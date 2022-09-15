import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { DatabaseModule } from '../../database.module'
import { studentProviders } from './entities/student.providers'
import { UsersModule } from '../users/users.module'
import { GradesModule } from '../grades/grades.module'
import { VotingModule } from '../voting/voting.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => UsersModule), forwardRef(() => GradesModule), VotingModule],
  controllers: [StudentsController],
  providers: [StudentsService, ...studentProviders],
  exports: [StudentsService, ...studentProviders],
})
export class StudentsModule {}
