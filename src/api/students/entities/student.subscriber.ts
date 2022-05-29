import { EventSubscriber } from 'typeorm'
import { Student } from './student.entity'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { Entities } from '../../common/enums'
import { GetLoggerStudentDto } from '../../loggers/dto/get-logger-student.dto'

@EventSubscriber()
export class StudentSubscriber extends LoggerSubscriber<Student> {
  listenTo() {
    return Student
  }

  getEntityName() {
    return Entities.STUDENTS
  }

  prepareData(data) {
    return plainToClass(GetLoggerStudentDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
