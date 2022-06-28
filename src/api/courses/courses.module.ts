import { Module } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { CoursesController } from './courses.controller'
import { DatabaseModule } from '../../database.module'
import { courseProviders } from './entities/course.providers'

@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, ...courseProviders],
  exports: [CoursesService, ...courseProviders],
})
export class CoursesModule {}
