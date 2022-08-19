import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateGradesHistoryDto } from './dto/create-grades-history.dto'
import { GRADE_HISTORY_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Student } from '../students/entities/student.entity'
import { GradeHistory } from './entities/grades-history.entity'
import { TokenDto } from '../../auth/dto/token.dto'
import { Course } from '../courses/entities/course.entity'
import { plainToClass } from 'class-transformer'
import { GetGradesHistoryResponseDto } from './dto/get-grades-history-response.dto'
import { User } from '../users/entities/user.entity'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'

export enum GradesHistoryColumns {
  ID = 'GradeHistory.id',
  COURSE_ID = 'Course.id',
  USER_ID = 'User.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'GradeHistory.grade',
}

export const GRADES_HISTORY_COLUMN_LIST = enumToArray(GradesHistoryColumns)
export const GRADES_HISTORY_COLUMNS = enumToObject(GradesHistoryColumns)

@Injectable()
export class GradesHistoryService {
  constructor(
    @Inject(GRADE_HISTORY_REPOSITORY)
    private gradesHistoryRepository: Repository<GradeHistory>,
  ) {}

  async create(createGradesHistoryDto: CreateGradesHistoryDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const student = await Student.findOne(createGradesHistoryDto.studentId)

    if (!student) {
      throw new BadRequestException(`Студент з ID: ${createGradesHistoryDto.studentId} не існує.`)
    }

    const course = await Course.findOne(createGradesHistoryDto.courseId)

    if (!course) {
      throw new BadRequestException(`Курс з ID: ${createGradesHistoryDto.courseId} не існує.`)
    }

    const userChanged = await User.findOne(sub)

    const gradeHistory = await this.gradesHistoryRepository
      .create({
        ...createGradesHistoryDto,
        student,
        course,
        userChanged,
      })
      .save({ data: { id: sub } })

    return plainToClass(GetGradesHistoryResponseDto, gradeHistory, { excludeExtraneousValues: true })
  }

  async findAll(
    options: IPaginationOptions,
    orderByColumn: GradesHistoryColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    userChangedId: number,
    courseId: number,
    grade: number,
    reasonOfChange: string,
  ) {
    orderByColumn = orderByColumn || GradesHistoryColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADES_HISTORY_COLUMN_LIST, orderByColumn)

    const query = this.gradesHistoryRepository
      .createQueryBuilder('GradeHistory')
      .leftJoinAndSelect('GradeHistory.student', 'Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('GradeHistory.course', 'Course')
      .leftJoinAndSelect('GradeHistory.userChanged', 'UserChanged')

    if (grade) {
      query.andWhere(`GradeHistory.grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (userChangedId) {
      query.andWhere(`UserChanged.id=:userChangedId`, { userChangedId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    if (reasonOfChange) {
      query.andWhere(`GradeHistory.reasonOfChange=:reasonOfChange`, { reasonOfChange })
    }
    console.log(await query.getMany())
    query.orderBy(`${orderByColumn}`, orderBy)
    return paginateAndPlainToClass(GetGradesHistoryResponseDto, query, options)
  }
}
