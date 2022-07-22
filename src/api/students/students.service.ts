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
    const { sub } = tokenDto

    const group = await Group.findOne(createStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(`Групу з id: ${createStudentDto.groupId},не знайдено`)
    }

    if (await this.findOneByEdeboId(createStudentDto.edeboId)) {
      throw new BadRequestException(`Студент з таким ЕДЕБО : ${createStudentDto.edeboId} вже існує`)
    }

    if (user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`Користувач не може бути зареєстрованим ,бо має роль: ${user.role}`)
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
      throw new NotFoundException(`Студента з id: ${id} не знайдено`)
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
      throw new BadRequestException(`Студент з таким ЕДЕБО : ${edeboId} вже існує`)
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
      throw new NotFoundException(`Студента з id:${userId}, не існує`)
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
      throw new BadRequestException(`Студент з таким ЕДЕБО : ${updateStudentDto.edeboId} вже існує`)
    }

    if (user && user.role && user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`Студент не може бути змінений , бо має роль :${user.role}`)
    }

    const student = await this.studentsRepository.findOne(id)
    if (!student) {
      throw new NotFoundException(`Студент з id: ${id} не знайдений`)
    }
    Object.assign(student, updateStudentDto)

    const group = await Group.findOne(updateStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(` Група з іd: ${updateStudentDto.groupId} не існує`)
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
      throw new NotAcceptableException('Не вишло зберегти студента. ' + e.message)
    }
    return {
      success: true,
    }
  }

  async remove(id: number, userId?: number) {
    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Студент з id: ${id} не знайдений `)
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
      throw new NotAcceptableException('Не вишло видалити студента. ' + e.message)
    }
  }
}
