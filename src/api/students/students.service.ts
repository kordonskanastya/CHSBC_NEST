import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'
import { TokenDto } from '../../auth/dto/token.dto'
import { ROLE } from '../../auth/roles/role.enum'
import { STUDENT_REPOSITORY } from '../../constants'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { Group } from '../groups/entities/group.entity'
import { User } from '../users/entities/user.entity'
import { CreateStudentResponseDto } from './dto/create-student-response.dto'
import { CreateStudentDto } from './dto/create-student.dto'
import { GetStudentResponseDto } from './dto/get-student-response.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { Student } from './entities/student.entity'

export enum StudentColumns {
  ID = 'id',
  DATE_OF_BIRTH = 'dateOfBirth',
  GROUP_ID = 'groupId',
  STUDENT_ID = 'studentId',
  ORDER_NUMBER = 'orderNumber',
  EDEBO_ID = 'edeboId',
  IS_FULL_TIME = 'isFullTime',
}

export const STUDENT_COLUMN_LIST = enumToArray(StudentColumns)
export const STUDENT_COLUMNS = enumToObject(StudentColumns)

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto, tokenDto?: TokenDto): Promise<CreateStudentResponseDto> {
    const { sub, role } = tokenDto || {}
    const studentCheck = await User.findOne(createStudentDto.userId)

    if (!studentCheck || studentCheck.role !== ROLE.STUDENT) {
      throw new BadRequestException(`This student id: ${createStudentDto.userId} not found or not student.`)
    }

    const user = await User.findOne(createStudentDto.userId)

    const group = await Group.findOne(createStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(`This group with Id: ${createStudentDto.userId} doesn't exist.`)
    }

    if (
      await this.studentsRepository
        .createQueryBuilder()
        .where(`Student.edeboId = LOWER(:edeboId)`, { edeboId: createStudentDto.edeboId })
        .getOne()
    ) {
      throw new BadRequestException(`This student edeboId: ${createStudentDto.edeboId} already exist.`)
    }

    if (
      await this.studentsRepository
        .createQueryBuilder()
        .where(`Student.userId = :userId`, { userId: createStudentDto.userId })
        .getOne()
    ) {
      throw new BadRequestException(`This student user: ${createStudentDto.userId} already exist.`)
    }

    const student = await this.studentsRepository
      .create({
        ...createStudentDto,
        group,
        user,
      })
      .save({
        data: {
          id: sub,
        },
      })

    return plainToClass(CreateStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: StudentColumns,
    orderBy: 'ASC' | 'DESC',
    group: string,
    orderNumber: string,
    edeboId: string,
    isFullTime: boolean,
    token: TokenDto,
  ) {
    orderByColumn = orderByColumn || StudentColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(STUDENT_COLUMN_LIST, orderByColumn)

    const query = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.group', 'group')

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(student.group), LOWER(student.orderNumber), LOWER(student.edeboId), LOWER(student.isFullTime)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (group) {
      query.andWhere(`LOWER(student.group) LIKE LOWER('%${group}%')`)
    }

    if (orderNumber) {
      query.andWhere(`LOWER(student.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }

    if (edeboId) {
      query.andWhere(`LOWER(student.edeboId) LIKE LOWER('%${edeboId}%')`)
    }

    if (isFullTime !== null) {
      query.andWhere(`student.isFullTime = :isFullTime`, { isFullTime })
    }

    query.orderBy(`student.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetStudentResponseDto, query, options)
  }

  async findOne(id: number, token?: TokenDto): Promise<GetStudentResponseDto> {
    const { sub, role } = token || {}
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    if (!student) {
      throw new NotFoundException(`Not found user id: ${id}`)
    }

    return plainToClass(GetStudentResponseDto, student)
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, { sub, role }: TokenDto): Promise<UpdateResponseDto> {
    if (
      await this.studentsRepository
        .createQueryBuilder()
        .where(`LOWER(Student.edeboId) LIKE LOWER('%${updateStudentDto.edeboId}%')`)
        .getOne()
    ) {
      throw new BadRequestException(`This student edeboId: ${updateStudentDto.edeboId} already exist.`)
    }

    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }

    Object.assign(student, updateStudentDto)

    try {
      await student.save({
        data: {
          student,
        },
      })
    } catch (e) {
      throw new NotAcceptableException("Can't save student. " + e.message)
    }
    return {
      success: true,
    }
  }

  async remove(id: number, userId?: number) {
    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }

    await this.studentsRepository.remove(student, {
      data: {
        id: userId,
      },
    })

    return {
      success: true,
    }
  }
}
