import { EventSubscriber } from 'typeorm'
import { Student } from './student.entity'
import { LoggerSubscriber } from '../../loggers/entities/logger-subscriber'
import { plainToClass } from 'class-transformer'
import { GetLoggerUserDto } from '../../loggers/dto/get-logger-user.dto'
import { Entities } from '../../common/enums'

@EventSubscriber()
export class StudentSubscriber extends LoggerSubscriber<Student> {
  listenTo() {
    return Student
  }

  getEntityName() {
    return Entities.STUDENTS
  }

  prepareData(data) {
    return plainToClass(GetLoggerUserDto, data, {
      excludeExtraneousValues: true,
    })
  }
}
