import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { CreateUserResponseDto } from './dto/create-user-response.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RefreshTokenList, User } from './entities/user.entity'
import { UpdateResult, Repository, Not } from 'typeorm'
import { GetUserResponseDto } from './dto/get-user-response.dto'
import { DeleteResponseDto } from '../common/dto/delete-response.dto'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { plainToClass } from 'class-transformer'
import * as bcrypt from 'bcrypt'
import * as moment from 'moment'
import { configService } from '../../config/config.service'
import { DurationInputArg1, DurationInputArg2 } from 'moment'
import { USER_REPOSITORY } from '../../constants'
import { AuthService } from '../../auth/auth.service'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { TokenDto } from '../../auth/dto/token.dto'
import { checkColumnExist, enumToArray, enumToObject, getDatabaseCurrentTimestamp } from '../../utils/common'

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

  async create({ studentData, ...createUserDto }: CreateUserDto, tokenDto?: TokenDto): Promise<CreateUserResponseDto> {
    const { sub, role } = tokenDto || {}

    const registerDto = {
      password: Buffer.from(Math.random().toString()).toString('base64').substring(0, 7),
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

    if (studentData) {
      console.log('student data is here')
      // create student
      // await this.studentsRepository.create(studentData).save()
    }
    console.log('student data is NOT here')

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
    status: boolean,
    token: TokenDto,
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

    return plainToClass(GetUserResponseDto, user)
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.email) = LOWER(:email)', { email })
      .getOne()
  }

  async findOneByLogin(login: string): Promise<User> {
    return await this.usersRepository
      .createQueryBuilder()
      .where('LOWER(User.login) = LOWER(:login)', { login })
      .getOne()
  }

  async update(id: number, updateUserDto: UpdateUserDto, { sub, role }: TokenDto): Promise<UpdateResponseDto> {
    const userDto = {
      password: '',
      ...updateUserDto,
    }

    // if (
    //   userDto.role &&
    //   (userDto.role === ROLE.ROOT || (role === ROLE.CURATOR && userDto.role !== ROLE.USER))
    // ) {
    //   throw new ForbiddenException("You don't have enough rights")
    // }

    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: userDto.email })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`This user email: ${userDto.email} already exist.`)
    }

    if (
      await this.usersRepository
        .createQueryBuilder()
        .where(`LOWER(email) = LOWER(:email)`, { email: userDto.email })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`This user email: ${userDto.email} already exist.`)
    }

    const user = await this.usersRepository.findOne(id)

    if (!user) {
      throw new NotFoundException(`Not found user id: ${id}`)
    }

    Object.assign(user, userDto)

    // switch (role) {
    //   case ROLE.USER:
    //     if (userDto.status && userDto.status !== user.status) {
    //       throw new ForbiddenException("You don't have enough rights")
    //     }
    //     break
    //
    //   case ROLE.MANAGER:
    //     if (sub === `${id}`) {
    //       if (userDto.status && userDto.status !== user.status) {
    //         throw new ForbiddenException("You don't have enough rights")
    //       }
    //     } else {
    //       if (user.role !== ROLE.USER) {
    //         throw new ForbiddenException("You don't have enough rights")
    //       }
    //     }
    //     break
    // }

    if (userDto.password) {
      await user.hashPassword()
    }

    try {
      await user.save({
        data: {
          user,
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
}
