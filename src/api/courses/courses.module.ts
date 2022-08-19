import { Module } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { CoursesController } from './courses.controller'
import { DatabaseModule } from '../../database.module'
import { courseProviders } from './entities/course.providers'
import { GradesModule } from '../grades/grades.module'

@Module({
  imports: [DatabaseModule, GradesModule],
  controllers: [CoursesController],
  providers: [CoursesService, ...courseProviders],
  exports: [CoursesService, ...courseProviders],
})
export class CoursesModule {}
