import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateGradesHistoryDto } from './dto/create-grades-history.dto'
import { GRADE_HISTORY_REPOSITORY, STUDENT_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Student } from '../students/entities/student.entity'
import { GradeHistory } from './entities/grades-history.entity'
import { TokenDto } from '../../auth/dto/token.dto'
import { Course } from '../courses/entities/course.entity'
import { plainToClass } from 'class-transformer'
import { GetGradesHistoryResponseDto } from './dto/get-grades-history-response.dto'
import { User } from '../users/entities/user.entity'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { GetGradesHistoryDto } from './dto/get-grades-history.dto'
import { SEMESTER } from '../courses/courses.service'

export enum GradesHistoryColumns {
  ID = 'GradeHistory.id',
  COURSE_ID = 'Course.id',
  USER_ID = 'User.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'GradeHistory.grade',
  CREATED = 'GradeHistory_Student.createdAt',
  UPDATED = 'GradeHistory_Student.updatedAt',
}

export const GRADES_HISTORY_COLUMN_LIST = enumToArray(GradesHistoryColumns)
export const GRADES_HISTORY_COLUMNS = enumToObject(GradesHistoryColumns)

@Injectable()
export class GradesHistoryService {
  constructor(
    @Inject(GRADE_HISTORY_REPOSITORY)
    private gradesHistoryRepository: Repository<GradeHistory>,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: Repository<Student>,
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
    orderByColumn: GradesHistoryColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    userChangedId: number,
    courseId: number,
    grade: number,
    reasonOfChange: string,
    semester: SEMESTER,
  ) {
    orderByColumn = orderByColumn || GradesHistoryColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADES_HISTORY_COLUMN_LIST, orderByColumn)

    const query = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.gradesHistories', 'GradeHistory_Student')
      .leftJoinAndSelect(GradeHistory, 'GradeHistory', 'GradeHistory.studentId=Student.id')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('GradeHistory_Student.course', 'Course')
      .leftJoinAndSelect('GradeHistory_Student.userChanged', 'UserChanged')
      .leftJoinAndSelect('Student.group', 'Group')

    if (grade) {
      query.andWhere(`GradeHistory.grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (semester) {
      query.andWhere(`Course.semester=:semester`, { semester })
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

    query.orderBy(`${orderByColumn}`, orderBy)
    return plainToClass(GetGradesHistoryDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOne(id: number, courseId: number, semester: SEMESTER) {
    const query = this.studentRepository
      .createQueryBuilder('Student')
      .innerJoinAndSelect('Student.gradesHistories', 'GradeHistory_Student')
      .innerJoinAndSelect(GradeHistory, 'GradeHistory', 'GradeHistory.studentId=Student.id')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('GradeHistory_Student.course', 'Course')
      .leftJoinAndSelect('GradeHistory_Student.userChanged', 'UserChanged')
      .leftJoinAndSelect('Student.group', 'Group')
      .where('Student.id=:id', { id })

    const student = await query.getOne()

    if (!student) {
      throw new NotFoundException(`Студента з id: ${id} не знайдено`)
    }

    if (semester) {
      query.andWhere(`Course.semester=:semester`, { semester })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (!(await query.getOne())) {
      Object.assign(student, { ...student, gradesHistories: [] })
      return plainToClass(GetGradesHistoryDto, student, { excludeExtraneousValues: true })
    }
    return plainToClass(GetGradesHistoryDto, query.getOne(), { excludeExtraneousValues: true })
  }
}
