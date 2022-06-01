import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { Not, Repository } from 'typeorm'
import { AuthService } from '../../auth/auth.service'
import { TokenDto } from '../../auth/dto/token.dto'
import { STUDENT_REPOSITORY } from '../../constants'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { Group } from '../groups/entities/group.entity'
import { GroupsService } from '../groups/groups.service'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
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
    @Inject(forwardRef(() => UsersService))
    private studentsRepository: Repository<Student>,
    private usersRepository: Repository<User>,
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createStudentDto: CreateStudentDto, tokenDto?: TokenDto): Promise<CreateStudentResponseDto> {
    const { sub, role } = tokenDto || {}

    if (!(await this.usersRepository.findOne(createStudentDto.userId))) {
      throw new BadRequestException(`This student with Id: ${createStudentDto.userId} doesn't exist.`)
    }

    if (!(await this.groupsRepository.findOne(createStudentDto.groupId))) {
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

    const student = await this.studentsRepository.create(createStudentDto).save({
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
      .leftJoinAndSelect('student.userId', 'user')
      .leftJoinAndSelect('student.groupId', 'group')

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
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.userId', 'user')
      .leftJoinAndSelect('student.groupId', 'group')
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
