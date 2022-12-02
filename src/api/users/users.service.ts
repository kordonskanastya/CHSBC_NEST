import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RefreshTokenList, User } from './entities/user.entity'
import { Not, Repository, UpdateResult } from 'typeorm'
import { GetUserResponseDto } from './dto/get-user-response.dto'
import { DeleteResponseDto } from '../common/dto/delete-response.dto'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { plainToClass } from 'class-transformer'
import * as bcrypt from 'bcrypt'
import * as moment from 'moment'
import { DurationInputArg1, DurationInputArg2 } from 'moment'
import { configService } from '../../config/config.service'
import { USER_REPOSITORY } from '../../constants'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { TokenDto } from '../../auth/dto/token.dto'
import { checkColumnExist, enumToArray, enumToObject, getDatabaseCurrentTimestamp } from '../../utils/common'
import { AuthService } from '../../auth/auth.service'
import { CreateUserResponseDto } from './dto/create-user-response.dto'
import { GetUserDropdownResponseDto } from './dto/get-user-dropdown-response.dto'
import { ROLE } from '../../auth/roles/role.enum'
import { GetGroupsByCuratorDto } from './dto/get-groups-by-curator.dto'
import { GetTeacherCoursesDto } from './dto/get-teacher-courses.dto'
import { Student } from '../students/entities/student.entity'
import { Grade } from '../grades/entities/grade.entity'
import { GetTeacherInfoDto } from './dto/get-teacher-info.dto'
import { GRADE_COLUMN_LIST, GradeColumns } from '../grades/grades.service'
import { SEMESTER } from '../courses/courses.service'
import { StudentColumns } from '../students/students.service'
import { GetStudentForGradeDto } from '../students/dto/get-student-for-grade.dto'

export enum UserColumns {
  ID = 'id',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  EMAIL = 'email',
  ROLE = 'role',
  CREATED = 'created',
  UPDATED = 'updated',
}

export const USER_COLUMN_LIST = enumToArray(UserColumns)
export const USER_COLUMNS = enumToObject(UserColumns)

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, await bcrypt.genSalt(10))
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    @Inject(forwardRef(() => AuthService))
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto, tokenDto?: TokenDto): Promise<CreateUserResponseDto> {
    const { sub } = tokenDto || {}

    const registerDto = {
      password: Buffer.from(Math.random().toString()).toString('base64').substring(0, 8),
      ...createUserDto,
    }

    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: registerDto.email })
        .getOne()
    ) {
      throw new BadRequestException(`Користувач з емейлом : ${registerDto.email} Вже існує.`)
    }

    const user = await this.usersRepository.create(registerDto).save({
      data: {
        id: sub,
      },
    })

    if (!user) {
      throw new BadRequestException(`Не вишло створити користувача`)
    }

    this.authService.sendMailCreatePassword({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
      email: registerDto.email,
    })

    return plainToClass(CreateUserResponseDto, user, {
      excludeExtraneousValues: true,
    })
  }

  selectUsers() {
    return this.usersRepository.createQueryBuilder()
  }

  async findAllWithPagination(
    options: IPaginationOptions,
    search: string,
    orderByColumn: UserColumns,
    orderBy: 'ASC' | 'DESC',
    id: number,
    name: string,
    firstName: string,
    lastName: string,
    patronymic: string,
    email: string,
    role: string,
  ) {
    orderByColumn = orderByColumn || UserColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(USER_COLUMN_LIST, orderByColumn)

    const query = this.selectUsers().where({
      role: Not('root'),
    })

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(User.firstName), LOWER(User.lastName), LOWER(User.patronymic), LOWER(User.email)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (id) {
      query.andWhere(`User.id=:id`, { id })
    }

    if (firstName) {
      query.andWhere(`LOWER(User.firstName) LIKE LOWER(:firstname)`, { firstname: `%${firstName}%` })
    }

    if (lastName) {
      query.andWhere(`LOWER(User.lastName) LIKE LOWER(':lastname)`, { lastname: `%${lastName}%` })
    }

    if (patronymic) {
      query.andWhere(`LOWER(User.patronymic) LIKE LOWER(':patronymic')`, { patronymic: `%${patronymic}%` })
    }

    if (name) {
      query.andWhere(
        `concat_ws(' ', LOWER(User.firstName), LOWER(User.lastName), LOWER(User.firstName)) LIKE LOWER(:name)`,
        {
          name: `%${name}%`,
        },
      )
    }

    if (email) {
      query.andWhere(`LOWER(User.email) LIKE LOWER(:email)`, {
        email: `%${email}%`,
      })
    }

    if (role) {
      query.andWhere('User.role = :role', {
        role,
      })
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetUserResponseDto, query, options)
  }

  async findAllWithoutPagination(
    search: string,
    orderByColumn: UserColumns,
    orderBy: 'ASC' | 'DESC',
    id: number,
    name: string,
    firstName: string,
    lastName: string,
    patronymic: string,
    email: string,
    role: string,
  ) {
    orderByColumn = orderByColumn || UserColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(USER_COLUMN_LIST, orderByColumn)

    const query = this.selectUsers().where({
      role: Not('root'),
    })

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(User.firstName), LOWER(User.lastName), LOWER(User.patronymic), LOWER(User.email)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (id) {
      query.andWhere(`User.id=:id`, { id })
    }

    if (firstName) {
      query.andWhere(`LOWER(User.firstName) LIKE LOWER(:firstname)`, { firstname: `%${firstName}%` })
    }

    if (lastName) {
      query.andWhere(`LOWER(User.lastName) LIKE LOWER(':lastname)`, { lastname: `%${lastName}%` })
    }

    if (patronymic) {
      query.andWhere(`LOWER(User.patronymic) LIKE LOWER(':patronymic')`, { patronymic: `%${patronymic}%` })
    }

    if (name) {
      query.andWhere(
        `concat_ws(' ', LOWER(User.firstName), LOWER(User.lastName), LOWER(User.firstName)) LIKE LOWER(:name)`,
        {
          name: `%${name}%`,
        },
      )
    }

    if (email) {
      query.andWhere(`LOWER(User.email) LIKE LOWER(:email)`, {
        email: `%${email}%`,
      })
    }

    if (role) {
      query.andWhere('User.role = :role', {
        role,
      })
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    return plainToClass(GetUserResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOne(id: number, token?: TokenDto): Promise<GetUserResponseDto> {
    const user = await this.selectUsers().andWhere({ id }).getOne()

    if (!user) {
      throw new NotFoundException(`Користувач з id: ${id} не існує `)
    }

    return plainToClass(GetUserResponseDto, user, { excludeExtraneousValues: true })
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.email) = LOWER(:email)', { email })
      .getOne()
  }

  async update(id: number, updateUserDto: UpdateUserDto, { sub }: TokenDto): Promise<UpdateResponseDto> {
    const userDto = {
      password: '',
      ...updateUserDto,
    }

    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: updateUserDto.email })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`Користвувач з такою електронною поштою: ${updateUserDto.email} вже існує.`)
    }

    const user = await this.selectUsers().andWhere({ id }).getOne()

    if (!user) {
      throw new NotFoundException(`Користувач з id: ${id} не знайдений`)
    }

    if (user.email !== updateUserDto.email) {
      this.authService.sendMailCreatePassword({
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        password: updateUserDto.password,
        email: updateUserDto.email,
      })
    }

    Object.assign(user, updateUserDto)

    if (updateUserDto.password) {
      await user.hashPassword()
    }

    try {
      await user.save({
        data: {
          id: sub,
        },
      })
    } catch (e) {
      throw new NotAcceptableException('Не вишло зберегти користувача. ' + e.message)
    }
    return {
      success: true,
    }
  }

  async filterExpiresRefreshTokenList(refreshTokenList: RefreshTokenList = []): Promise<RefreshTokenList> {
    const now = await getDatabaseCurrentTimestamp()
    const list = refreshTokenList ? refreshTokenList?.filter(({ expiresIn }) => moment(expiresIn).diff(now) > 0) : []

    if (!list || list.length > 100) {
      list.shift()
    }

    return list
  }

  async removeRefreshToken(id: number, usedToken: string): Promise<UpdateResponseDto> {
    const { refreshTokenList = [] } = await this.usersRepository.findOne(id)
    const updateResult: UpdateResult = await this.usersRepository.update(
      { id },
      {
        refreshTokenList:
          refreshTokenList && refreshTokenList.length
            ? refreshTokenList.filter(({ token }) => token !== usedToken)
            : [],
      },
    )

    return {
      success: updateResult.affected > 0,
    }
  }

  async addRefreshToken(id: number, token: string): Promise<UpdateResponseDto> {
    const { refreshTokenList = [] } = await this.usersRepository.findOne(id)
    const newList = await this.filterExpiresRefreshTokenList(refreshTokenList)
    const expiresIn = configService.getJWTRefreshTokenLifetime().toString()

    newList.push({
      token,
      expiresIn: moment()
        .add(expiresIn.match(/[0-9]+/)[0] as DurationInputArg1, expiresIn.match(/[a-z]+/)[0] as DurationInputArg2)
        .toDate(),
    })

    const updateResult: UpdateResult = await this.usersRepository.update(
      { id },
      {
        refreshTokenList: newList,
      },
    )

    return {
      success: updateResult.affected > 0,
    }
  }

  async remove(id: number, userId?: number): Promise<DeleteResponseDto> {
    const user = await this.usersRepository.findOne(id)

    if (!user) {
      throw new NotFoundException(`Користувач з id: ${id} не знайдений`)
    }

    await this.usersRepository.remove(user, {
      data: {
        id: userId,
      },
    })

    return {
      success: true,
    }
  }

  async dropdownTeacher() {
    const teachers = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.TEACHER })

    return plainToClass(GetUserDropdownResponseDto, teachers.getMany(), { excludeExtraneousValues: true })
  }

  async dropdownAdmin() {
    const administrators = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.ADMIN })

    return plainToClass(GetUserDropdownResponseDto, administrators.getMany(), { excludeExtraneousValues: true })
  }

  async getCuratorsGroups(
    options: IPaginationOptions,
    groupName: string,
    curatorId: number,
    orderBy: 'ASC' | 'DESC',
    orderByColumn: UserColumns,
  ) {
    orderByColumn = orderByColumn || UserColumns.ID
    orderBy = orderBy || 'ASC'

    const query = this.usersRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.groups', 'Group')
      .where('User.role=:role', { role: ROLE.CURATOR })

    if (groupName) {
      query.andWhere('Group.name LIKE :name', { name: `%${groupName}%` })
    }

    if (curatorId) {
      query.andWhere('User.id = :curatorId', { curatorId })
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    // const sortFunction =
    //   orderBy === 'DESC'
    //     ? ({ [orderByColumn]: a }, { [orderByColumn]: b }) => (a > b ? -1 : a < b ? 1 : 0)
    //     : ({ [orderByColumn]: a }, { [orderByColumn]: b }) => (a < b ? -1 : a > b ? 1 : 0)

    return await paginateAndPlainToClass(GetGroupsByCuratorDto, query, options)
    //   , ({ items, ...query }) => ({
    //   items: items.map((data: { groups: { id: number }[] }) => {
    //     if (data.groups && data.groups.length) {
    //       data.groups.sort(sortFunction)
    //     }
    //
    //     return data
    //   }),
    //   ...query,
    // }))
  }

  async getCoursesByTeacher(
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    orderByColumn: UserColumns,
    teacherId: number,
    groups: number[],
    courses: number[],
  ) {
    orderByColumn = orderByColumn || UserColumns.ID
    orderBy = orderBy || 'ASC'

    const query = this.usersRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.courses', 'Course')
      .leftJoinAndSelect('Course.groups', 'Group')
      .andWhere('User.role=:role', { role: ROLE.TEACHER })

    if (teacherId) {
      query.andWhere('User.id=:teacherId', { teacherId })
    }

    if (groups) {
      if (typeof groups === 'object') {
        query.andWhere('Group.id IN (:...groups)', { groups })
      } else {
        if (typeof groups === 'string') {
          query.andWhere('Group.id=:groupId', { groupId: groups })
        }
      }
    }

    if (courses) {
      if (typeof courses === 'object') {
        query.andWhere('Course.id IN (:...courses)', { courses })
      } else {
        if (typeof courses === 'string') {
          query.andWhere('Course.id=:courseId', { courseId: courses })
        }
      }
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetTeacherCoursesDto, query, options)
  }

  async getCuratorInfo(
    token: TokenDto,
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    orderByColumn: StudentColumns,
    studentId: number,
    groupId: number,
    semester: SEMESTER,
  ) {
    const { sub } = token || {}
    orderByColumn = orderByColumn || StudentColumns.ID
    orderBy = orderBy || 'ASC'

    const curatorInfo = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoin('Group.curator', 'Curator')
      .where('Curator.id=:id', { id: sub })

    if (studentId) {
      curatorInfo.andWhere(`Student.id=:studentId`, { studentId })
    }

    if (groupId) {
      curatorInfo.andWhere(`Group.id=:groupId`, { groupId })
    }

    if (semester) {
      curatorInfo.andWhere(`Course.semester=:semester`, { semester })
    }

    curatorInfo.orderBy(`Student.${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetStudentForGradeDto, curatorInfo, options)
  }

  async getTeacherInfo(
    token: TokenDto,
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    orderByColumn: GradeColumns,
    studentId: number,
    groupId: number,
    courseId: number,
  ) {
    const { sub } = token || {}
    orderByColumn = orderByColumn || GradeColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GRADE_COLUMN_LIST, orderByColumn)

    const teacherInfoQuery = Grade.createQueryBuilder('Grade')
      .leftJoinAndSelect('Grade.student', 'Student')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Course.groups', 'Course_group')
      .leftJoin('Course.teacher', 'Teacher')
      .leftJoinAndSelect('Student.user', 'User')
      .where('Teacher.id=:id', { id: sub })
      .andWhere('Group.id=Course_group.id')

    if (studentId) {
      teacherInfoQuery.andWhere(`Student.id=:studentId`, { studentId })
    }

    if (groupId) {
      teacherInfoQuery.andWhere(`Group.id=:groupId`, { groupId })
    }

    if (courseId) {
      teacherInfoQuery.andWhere(`Course.id=:courseId`, { courseId })
    }

    teacherInfoQuery.orderBy(`${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetTeacherInfoDto, teacherInfoQuery, options)
  }
}
