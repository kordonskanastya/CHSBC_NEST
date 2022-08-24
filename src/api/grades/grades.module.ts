import { forwardRef, Module } from '@nestjs/common'
import { GradesService } from './grades.service'
import { GradesController } from './grades.controller'
import { DatabaseModule } from '../../database.module'
import { gradeProviders } from './entities/grade.providers'
import { StudentsModule } from '../students/students.module'
import { GradesHistoryModule } from '../grades-history/grades-history.module'

@Module({
  imports: [DatabaseModule, forwardRef(() => StudentsModule), GradesHistoryModule],
  controllers: [GradesController],
  providers: [GradesService, ...gradeProviders],
  exports: [GradesService, ...gradeProviders],
})
export class GradesModule {}
