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
  User: any
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentsRepository: Repository<Student>,
    private usersService: UsersService,
  ) {}

  async create(
    { user, ...createStudentDto }: CreateStudentDto,
    tokenDto?: TokenDto,
  ): Promise<CreateStudentResponseDto> {
    const { sub, role } = tokenDto

    const group = await Group.findOne(createStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(`This group with Id: ${createStudentDto.groupId} doesn't exist.`)
    }

    if (await this.findOneByEdeboId(createStudentDto.edeboId)) {
      throw new BadRequestException(`This student edeboId: ${createStudentDto.edeboId} already exist.`)
    }

    if (user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`This user can't be registered as student because has role: ${user.role}`)
    }

    const { id: userId } = await this.usersService.create(user, tokenDto)

    const student = await this.studentsRepository
      .create({
        ...createStudentDto,
        group,
        user: await User.findOne(userId),
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
    firstName: string,
    lastName: string,
    patronymic: string,
    email: string,
    group: number,
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
      .where('user.role = :role', {
        role: 'student',
      })

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(student.group), LOWER(student.orderNumber), LOWER(student.edeboId), LOWER(student.isFullTime)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (firstName) {
      query.andWhere(`LOWER(user.firstName) LIKE LOWER('%${firstName}%')`)
    }
    if (lastName) {
      query.andWhere(`LOWER(user.lastName) LIKE LOWER('%${lastName}%')`)
    }
    if (patronymic) {
      query.andWhere(`LOWER(user.patronymic) LIKE LOWER('%${patronymic}%')`)
    }
    if (email) {
      query.andWhere(`LOWER(user.email) LIKE LOWER('%${email}%')`)
    }

    if (group) {
      query.andWhere('student.group = :group', {
        group,
      })
    }

    if (orderNumber) {
      query.andWhere(`LOWER(student.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }

    if (edeboId) {
      query.andWhere(`LOWER(student.edeboId) LIKE LOWER('%${edeboId}%')`)
    }

    if (isFullTime !== undefined) {
      query.andWhere(`student.isFullTime = :isFullTime`, { isFullTime })
    }

    query.orderBy(`student.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetStudentResponseDto, query, options)
  }

  async findOne(id: number, token?: TokenDto): Promise<GetStudentResponseDto> {
    const { sub, role } = token
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }

    return plainToClass(GetStudentResponseDto, student, { excludeExtraneousValues: true })
  }

  async findOneByEdeboId(edeboId: string): Promise<GetStudentResponseDto> {
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .where({ edeboId })
      .getOne()

    if (student) {
      throw new NotFoundException(`Student with this edeboid: ${edeboId}, already exist`)
    }

    return plainToClass(GetStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  async findOneByUserId(userId: number): Promise<GetStudentResponseDto> {
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .where({ user: userId })
      .getOne()

    if (!student) {
      throw new NotFoundException(`Student with this userId: ${userId}, doesn't exist`)
    }

    return plainToClass(GetStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  async update(
    id: number,
    { user, ...updateStudentDto }: UpdateStudentDto,
    { sub, role }: TokenDto,
  ): Promise<UpdateResponseDto> {
    if (await this.studentsRepository.createQueryBuilder().where({ edeboId: updateStudentDto.edeboId }).getOne()) {
      throw new BadRequestException(`This student edeboId: ${updateStudentDto.edeboId} already exist.`)
    }

    if (user && user.role && user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`This student can't be updated because you update the role: ${user.role}`)
    }

    const student = await this.studentsRepository.findOne(id)
    if (!student) {
      throw new NotFoundException(`Not found student id: ${id}`)
    }
    Object.assign(student, updateStudentDto)

    const group = await Group.findOne(updateStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(`This group with Id: ${updateStudentDto.groupId} doesn't exist.`)
    }

    const {
      user: { id: userId },
    } = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    Object.assign(student, updateStudentDto)

    try {
      if (user) {
        await this.usersService.update(userId, user, { sub, role })
      }
      await student.save({
        data: {
          id: sub,
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

    const {
      user: { id: userIdDeleted },
    } = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    try {
      await this.studentsRepository.remove(student, {
        data: {
          id: userId,
        },
      })

      await this.usersService.remove(userIdDeleted, userId)

      return { success: true }
    } catch (e) {
      throw new NotAcceptableException("Can't delete student. " + e.message)
    }
  }
}
