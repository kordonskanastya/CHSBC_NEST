import { Module } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { CoursesController } from './courses.controller'
import { DatabaseModule } from '../../database.module'
import { courseProviders } from './entities/course.providers'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [CoursesController],
  providers: [CoursesService, ...courseProviders],
  exports: [CoursesService, ...courseProviders],
})
export class CoursesModule {}
