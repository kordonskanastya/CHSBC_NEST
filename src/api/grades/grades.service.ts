import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GRADE_HISTORY_REPOSITORY, GRADE_REPOSITORY, STUDENT_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Grade } from './entities/grade.entity'
import { plainToClass } from 'class-transformer'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'
import { TokenDto } from '../../auth/dto/token.dto'
import { Course } from '../courses/entities/course.entity'
import { Student } from '../students/entities/student.entity'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { Group } from '../groups/entities/group.entity'
import { GetStudentForGradeDto } from '../students/dto/get-student-for-grade.dto'
import { GradeHistory } from '../grades-history/entities/grades-history.entity'
import { User } from '../users/entities/user.entity'
import { GetTeacherInfoDto } from '../users/dto/get-teacher-info.dto'
import { SEMESTER } from '../courses/courses.service'
import { ExelService } from '../../services/exel.service'

export enum GradeColumns {
  ID = 'Grade.id',
  COURSE_ID = 'Course.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'Grade.grade',
  CREATED = 'Grade.created',
  UPDATED = 'Grade.updated',
}

export enum ReasonForChangeGrade {
  EXAM = 'Екзамен',
  RETAKE = 'Перездача',
  MISTAKE = 'Помилкове введення оцінки',
}

export const GRADE_COLUMN_LIST = enumToArray(GradeColumns)
export const GRADE_COLUMNS = enumToObject(GradeColumns)

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: Repository<Student>,
    @Inject(GRADE_HISTORY_REPOSITORY)
    private gradeHistoryRepository: Repository<GradeHistory>,
  ) {}

  async findAllWithPagination(
    options: IPaginationOptions,
    search: string,
    orderByColumn: GradeColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    courseId: number,
    groupId: number,
    grade: number,
    semester: SEMESTER,
  ) {
    orderByColumn = orderByColumn || GradeColumns.STUDENT_ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADE_COLUMN_LIST, orderByColumn)

    const query = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.user', 'User')
    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ',"Student.id","Course.id") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (grade) {
      query.andWhere(`Grade.grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    if (groupId) {
      query.andWhere(`Group.id=:groupId`, { groupId })
    }

    if (semester) {
      query.andWhere('Course.semester=:semester', { semester })
    }

    query.orderBy(`${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetStudentForGradeDto, query, options)
  }

  async findAllWithOutPagination(
    search: string,
    orderByColumn: GradeColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    courseId: number,
    groupId: number,
    grade: number,
    semester: SEMESTER,
  ) {
    orderByColumn = orderByColumn || GradeColumns.STUDENT_ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADE_COLUMN_LIST, orderByColumn)

    const query = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.user', 'User')
    if (grade) {
      query.andWhere(`Grade.grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    if (groupId) {
      query.andWhere(`Group.id=:groupId`, { groupId })
    }

    if (semester) {
      query.andWhere('Course.semester=:semester', { semester })
    }

    query.orderBy(`${orderByColumn}`, orderBy)
    return plainToClass(GetStudentForGradeDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOneGradeByStudent(id: number, semester: SEMESTER) {
    const student = await Student.findOne(id)

    if (!student) {
      throw new BadRequestException(`Студента з  id: ${id} не знайдено.`)
    }

    const grades = this.studentRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.user', 'User')
      .andWhere('Student.id=:id', { id })

    if (!(await grades.getOne())) {
      throw new NotFoundException(`Не знайдено оцінки з id: ${id}`)
    }

    if (semester) {
      grades.andWhere('Course.semester=:semester', { semester })
    }

    return plainToClass(GetStudentForGradeDto, await grades.getOne(), {
      excludeExtraneousValues: true,
    })
  }

  async findOne(id: number) {
    const grade = this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.user', 'User')
      .where('Grade.id=:id', { id })
      .getOne()

    if (!grade) {
      throw new NotFoundException(`Не знайдено оцінки з id: ${id}`)
    }

    return plainToClass(GetTeacherInfoDto, grade, { excludeExtraneousValues: true })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const student = await Student.findOne(id)
    const course = await Course.findOne(updateGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`Студента з id: ${id} не знайдено .`)
    }

    if (!course) {
      throw new BadRequestException(`Предмета з id: ${updateGradeDto.courseId} не знайдено.`)
    }

    const grade = await this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.course', 'Course')
      .where('Grade.studentId=:studentId', { studentId: id })
      .andWhere('Course.id=:courseId', { courseId: updateGradeDto.courseId })
      .getOne()

    if (!grade) {
      throw new BadRequestException(`Оцінка не знайдена.`)
    }

    Object.assign(grade, updateGradeDto)

    const userChanged = await User.findOne(sub)

    try {
      await grade.save({ data: { id: sub } })
      await this.gradeHistoryRepository
        .create({
          student,
          course,
          userChanged,
          grade: updateGradeDto.grade,
          reasonOfChange: updateGradeDto.reasonForChange,
        })
        .save({ data: { id: sub } })
    } catch (e) {
      throw new NotAcceptableException("Can't save grade. " + e.message)
    }

    return {
      success: true,
    }
  }

  async remove(id: number, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const grade = await this.gradeRepository.findOne(id)

    if (!grade) {
      throw new NotFoundException(`Оцінку з id: ${id}`)
    }

    await this.gradeRepository.remove(grade, {
      data: {
        id: sub,
      },
    })

    return {
      success: true,
    }
  }

  async dropdownGroup(groupName: string) {
    const query = Group.createQueryBuilder('Group').leftJoin('Group.courses', 'Course').groupBy('Group.id')
    if (groupName) {
      query.andWhere('LOWER(Group.name) LIKE LOWER(:name)', { name: `%${groupName}%` })
    }
    query.having('Count(Course.id)>0')
    return plainToClass(CreateGroupResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async downloadStudentsGrades(id: number, semester: SEMESTER) {
    const data = await this.findOneGradeByStudent(id, semester)
    try {
      return await new ExelService().exportGradesToExel(data)
    } catch (e) {
      throw new BadRequestException(e)
    }
  }
}
