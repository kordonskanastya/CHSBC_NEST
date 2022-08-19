import { EventSubscriber } from 'typeorm'
import { Course } from './course.entity'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { Entities } from '../../common/enums'
import { GetLoggerCourseDto } from '../../loggers/dto/get-logger-course.dto'

@EventSubscriber()
export class CourseSubscriber extends LoggerSubscriber<Course> {
  listenTo() {
    return Course
  }

  getEntityName() {
    return Entities.COURSES
  }

  prepareData(data) {
    return plainToClass(GetLoggerCourseDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
