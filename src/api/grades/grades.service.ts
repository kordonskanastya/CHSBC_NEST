import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GRADE_REPOSITORY } from '../../constants'
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
import { GetGradeResponseDto } from './dto/get-grade-response.dto'

export enum GradeColumns {
  ID = 'Grade.id',
  COURSE_ID = 'Course.id',
  STUDENT_ID = 'Student.id',
  GRADE = 'Grade.grade',
}

export const GRADE_COLUMN_LIST = enumToArray(GradeColumns)
export const GRADE_COLUMNS = enumToObject(GradeColumns)

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const student = await Student.findOne(createGradeDto.studentId)
    const course = await Course.findOne(createGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`This student id: ${createGradeDto.studentId} not found.`)
    }

    if (!course) {
      throw new BadRequestException(`This course id: ${createGradeDto.courseId} not found.`)
    }

    const grade = await this.gradeRepository
      .create({
        ...createGradeDto,
        student,
        course,
      })
      .save({ data: { id: sub } })

    return plainToClass(CreateGroupResponseDto, grade, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: GradeColumns,
    orderBy: 'ASC' | 'DESC',
    studentId: number,
    courseId: number,
    grade: number,
  ) {
    orderByColumn = orderByColumn || GradeColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADE_COLUMN_LIST, orderByColumn)

    const query = this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Grade.course', 'Course')

    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ',"studentId","courseId","grade") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (grade) {
      query.andWhere(`grade = :grade`, { grade })
    }

    if (courseId) {
      query.andWhere(`Course.id=:courseId`, { courseId })
    }

    if (studentId) {
      query.andWhere(`Student.id=:studentId`, { studentId })
    }

    query.orderBy(`${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGradeResponseDto, query, options)
  }

  async findOne(id: number) {
    const student = await Student.findOne(id)

    if (!student) {
      throw new BadRequestException(`This student id: ${id} not found.`)
    }

    const grades = await this.gradeRepository
      .createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Grade.course', 'Course')
      .andWhere('Student.id=:id', { id })
      .getMany()
    if (!grades) {
      throw new NotFoundException(`Not found grades id: ${id}`)
    }
    return plainToClass(GetGradeResponseDto, grades, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto, tokenDto?: TokenDto) {
    // const { sub, role } = tokenDto || {}
    // const student = await this.gradeRepository
    //   .createQueryBuilder('Grade')
    //   .leftJoin('Grade.student', 'Student')
    //   .leftJoinAndSelect('Grade.course', 'Course')
    //   .andWhere('Student.id=:id', { id })
    //   .getMany()
    //
    // if (!student) {
    //   throw new BadRequestException(`This student id: ${id} not found.`)
    // }
    // console.log(updateGradeDto)
  }

  async remove(id: number) {
    return await `This action removes a #${id} grade`
  }
}
