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
import { GroupsColumns } from '../groups/groups.service'
import { Group } from '../groups/entities/group.entity'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'
import { GetCoursesByTeacherDto } from './dto/get-courses-by-teacher.dto'
import { CourseColumns } from '../courses/courses.service'
import { GetTeacherCourseDropdownDto } from './dto/get-teacher-course-dropdown.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { Course } from '../courses/entities/course.entity'
import { CreateTeacherDto } from './dto/create-teacher.dto'

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
      throw new BadRequestException(`This user email: ${registerDto.email} already exist.`)
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

  async createTeacher(createTeacherDto: CreateTeacherDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const registerDto = {
      password: Buffer.from(Math.random().toString()).toString('base64').substring(0, 8),
      email: createTeacherDto.email,
      role: ROLE.TEACHER,
      firstName: createTeacherDto.firstName,
      lastName: createTeacherDto.lastName,
      patronymic: createTeacherDto.patronymic,
    }

    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: registerDto.email })
        .getOne()
    ) {
      throw new BadRequestException(`This user email: ${registerDto.email} already exist.`)
    }
    const courseIds = Array.isArray(createTeacherDto.courses) ? createTeacherDto.courses : [createTeacherDto.courses]
    const courses = Course.createQueryBuilder('courses').where(`courses.id IN (:...ids)`, {
      ids: courseIds,
    })

    if (!courses || (await courses.getMany()).length !== courseIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createTeacherDto.courses} не існує .`)
    }
    const user = await this.usersRepository.create(registerDto).save({
      data: {
        id: sub,
      },
    })

    if (!user) {
      throw new BadRequestException(`Не вишло створити користувача`)
    }
    courses
      .update(Course)
      .set({
        teacher: user,
      })
      .execute()
    this.authService.sendMailCreatePassword({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
      email: registerDto.email,
    })

    return plainToClass(GetCoursesByTeacherDto, user, {
      excludeExtraneousValues: true,
    })
  }

  selectUsers() {
    return this.usersRepository.createQueryBuilder()
  }

  async findAll(
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
      query.andWhere(`LOWER(User.firstName) LIKE LOWER('%${firstName}%')`)
    }

    if (lastName) {
      query.andWhere(`LOWER(User.lastName) LIKE LOWER('%${lastName}%')`)
    }

    if (patronymic) {
      query.andWhere(`LOWER(User.patronymic) LIKE LOWER('%${patronymic}%')`)
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

  async findOne(id: number, token?: TokenDto): Promise<GetUserResponseDto> {
    const { sub, role } = token || {}
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
  async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto, { sub }: TokenDto): Promise<UpdateResponseDto> {
    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: updateTeacherDto.email })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`Користувач з такою електронною поштою: ${updateTeacherDto.email} вже існує.`)
    }

    const teacher = await this.selectUsers().andWhere({ id }).getOne()

    if (!teacher) {
      throw new NotFoundException(`Вчитель з id: ${id} не знайдений`)
    }
    if (teacher.role !== ROLE.TEACHER) {
      throw new BadRequestException(`Користувач не є вчителем ,він є ${teacher.role}`)
    }

    Object.assign(teacher, updateTeacherDto)

    if (updateTeacherDto.courses) {
      const courseIds = Array.isArray(updateTeacherDto.courses) ? updateTeacherDto.courses : [updateTeacherDto.courses]
      const courses = Course.createQueryBuilder('courses').where(`courses.id IN (:...ids)`, {
        ids: courseIds,
      })

      if (!courses || (await courses.getMany()).length !== courseIds.length) {
        throw new BadRequestException(`Предмет з іd: ${updateTeacherDto.courses} не існує .`)
      }

      courses
        .update(Course)
        .set({
          teacher: teacher,
        })
        .execute()

      try {
        await teacher.save({
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

  async dropdownTeacher(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', search: string) {
    const orderByColumn = CourseColumns.ID
    orderBy = orderBy || 'ASC'

    const teachers = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.TEACHER })

    if (search) {
      teachers.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER("firstName") , LOWER("lastName") , LOWER("patronymic")  ,LOWER(concat("firstName",' ', "lastName",' ',"patronymic"))) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    teachers.orderBy(`User.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetUserDropdownResponseDto, teachers, options)
  }

  async dropdownCurator(
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    search: string,
  ): Promise<GetUserDropdownResponseDto[]> {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const curators = this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.CURATOR })

    if (search) {
      curators.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER("firstName") , LOWER("lastName") , LOWER("patronymic")  ,LOWER(concat("firstName",' ', "lastName",' ',"patronymic"))) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    curators.orderBy(`User.${orderByColumn}`, orderBy)

    return (await curators.getMany()).map((curator) => {
      return {
        id: curator.id,
        firstName: curator.firstName,
        lastName: curator.lastName,
        patronymic: curator.patronymic,
      }
    })
  }

  async dropdownAdmin(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', orderByColumn: UserColumns) {
    orderByColumn = orderByColumn || UserColumns.ID

    const administrators = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.ADMIN })

    administrators.orderBy(`User.${orderByColumn}`, orderBy)

    return paginateAndPlainToClass(GetUserDropdownResponseDto, administrators, options)
  }

  async dropdownStudent(): Promise<GetUserDropdownResponseDto[]> {
    const students = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.STUDENT })
      .getMany()

    const resultArr = students.map((student) => {
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        patronymic: student.patronymic,
      }
    })

    return resultArr
  }

  async getGroupsByCurator(options: IPaginationOptions, groupName: string, curatorId: number, orderBy: 'ASC' | 'DESC') {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = this.usersRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.groups', 'Group')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")
      .andWhere('User.role=:role', { role: ROLE.CURATOR })

    if (groupName) {
      query.andWhere('Group.name LIKE :name', { name: `%${groupName}%` })
    }

    if (curatorId) {
      query.andWhere('Group.curatorId = :curatorId', { curatorId })
    }

    query.orderBy(`Group.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGroupsByCuratorDto, query, options)
  }

  async dropdownGroupName(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', groupName: string) {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = Group.createQueryBuilder('Group')
      .leftJoinAndSelect('Group.curator', 'User')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")

    if (groupName) {
      query
        .andWhere("(Group.deletedOrderNumber  <> '') IS  TRUE")
        .orWhere(`LOWER(Group.name) LIKE LOWER(:name)`, { name: `%${groupName}%` })
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(CreateGroupResponseDto, query, options)
  }

  async getCoursesByTeacher(
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    teacherId: number,
    groups: number[],
    courses: number[],
  ) {
    const orderByColumn = GroupsColumns.ID
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
    return await paginateAndPlainToClass(GetCoursesByTeacherDto, query, options)
  }

  async teacherDropdownCourseName(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', courseName: string) {
    const orderByColumn = CourseColumns.ID
    orderBy = orderBy || 'ASC'

    const query = User.createQueryBuilder('User')
      .leftJoinAndSelect('User.courses', 'Course')
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.TEACHER })

    if (courseName) {
      query.andWhere(`LOWER(Course.name) LIKE LOWER(:name)`, { name: `%${courseName}%` })
    }

    query.orderBy(`User.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetTeacherCourseDropdownDto, query, options)
  }

  async teacherDropdownGroupName(options: IPaginationOptions, orderBy: 'ASC' | 'DESC', groupName: string) {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = Group.createQueryBuilder('Group')
      .leftJoin('Group.courses', 'Course')
      .leftJoin('Course.teacher', 'User')
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.TEACHER })

    if (groupName) {
      query.andWhere(`LOWER(Group.name) LIKE LOWER(:name)`, { name: `%${groupName}%` })
    }

    query.orderBy(`Group.${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(CreateGroupResponseDto, query, options)
  }
  async teacherDropdownCompulsory() {
    return [
      { id: 1, type: `Обов'язковий`, isCompulsory: true },
      { id: 2, type: 'Вибірковий', isCompulsory: false },
    ]
  }
}
