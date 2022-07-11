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

  transformToFullName = (lastName: string, firstName: string, patronymic: string): string =>
    lastName + ' ' + firstName + ' ' + patronymic

  async create(createUserDto: CreateUserDto, tokenDto?: TokenDto): Promise<CreateUserResponseDto> {
    const { sub, role } = tokenDto || {}

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
      throw new BadRequestException(`Can't create user, some unexpected error`)
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

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: UserColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    firstName: string,
    lastName: string,
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
        `concat_ws(' ', LOWER(User.firstName), LOWER(User.lastName), LOWER(User.firstName), LOWER(User.email)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (firstName) {
      query.andWhere(`LOWER(User.firstName) LIKE LOWER('%${firstName}%')`)
    }

    if (lastName) {
      query.andWhere(`LOWER(User.lastName) LIKE LOWER('%${lastName}%')`)
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
      throw new NotFoundException(`Not found user id: ${id}`)
    }

    return plainToClass(GetUserResponseDto, user, { excludeExtraneousValues: true })
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.email) = LOWER(:email)', { email })
      .getOne()
  }

  async update(id: number, updateUserDto: UpdateUserDto, { sub, role }: TokenDto): Promise<UpdateResponseDto> {
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
      throw new BadRequestException(`This user email: ${updateUserDto.email} already exist.`)
    }

    const user = await this.selectUsers().andWhere({ id }).getOne()

    if (!user) {
      throw new NotFoundException(`Not found user id: ${id}`)
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
      throw new NotAcceptableException("Can't save user. " + e.message)
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
      throw new NotFoundException(`Not found user id: ${id}`)
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

  async dropdownTeacher(
    options: IPaginationOptions,
    orderBy: 'ASC' | 'DESC',
    search: string,
  ): Promise<GetUserDropdownResponseDto[]> {
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

    return (await teachers.getMany()).map((teacher) => {
      return {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        patronymic: teacher.patronymic,
      }
    })
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

  async dropdownAdmin(): Promise<GetUserDropdownResponseDto[]> {
    const administrators = await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.role) = LOWER(:role)', { role: ROLE.ADMIN })
      .getMany()

    const resultArr = administrators.map((admin) => {
      return {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        patronymic: admin.patronymic,
      }
    })

    return resultArr
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

  async getGroupsByCurator(options: IPaginationOptions, orderBy: 'ASC' | 'DESC') {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = this.usersRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.groups', 'Group')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")
      .andWhere('User.role=:role', { role: ROLE.CURATOR })

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

  async getCoursesByTeacher(options: IPaginationOptions, orderBy: 'ASC' | 'DESC') {
    const orderByColumn = GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    const query = this.usersRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.courses', 'Course')
      .leftJoinAndSelect('Course.groups', 'Group')
      .andWhere('User.role=:role', { role: ROLE.TEACHER })

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
