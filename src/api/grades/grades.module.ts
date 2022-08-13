import { Module } from '@nestjs/common'
import { GradesService } from './grades.service'
import { GradesController } from './grades.controller'
import { DatabaseModule } from '../../database.module'
import { gradeProviders } from './entities/grade.providers'
import { StudentsModule } from '../students/students.module'

@Module({
  imports: [DatabaseModule, StudentsModule],
  controllers: [GradesController],
  providers: [GradesService, ...gradeProviders],
  exports: [GradesService, ...gradeProviders],
})
export class GradesModule {}
