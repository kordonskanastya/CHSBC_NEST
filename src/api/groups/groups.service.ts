import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateExactFieldDto } from './dto/update-exact-field.dto'
import { GROUP_REPOSITORY } from '../../constants'
import { Not, Repository } from 'typeorm'
import { Group } from './entities/group.entity'
import { CreateGroupResponseDto } from './dto/create-group-response.dto'
import { plainToClass } from 'class-transformer'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { TokenDto } from '../../auth/dto/token.dto'
import { GetGroupResponseDto } from './dto/get-group-response.dto'
import { User } from '../users/entities/user.entity'
import { ROLE } from '../../auth/roles/role.enum'
import { GetUserDropdownResponseDto } from '../users/dto/get-user-dropdown-response.dto'
import { DeleteResponseDto } from '../common/dto/delete-response.dto'

export enum GroupsColumns {
  ID = 'id',
  NAME = 'Name',
  CURATOR_ID = 'curator_id',
  ORDER_NUMBER = 'order_number',
  DELETED_ORDER_NUMBER = 'deleted_order_number',
  CREATED = 'created',
  UPDATED = 'updated',
}

export const GROUPS_COLUMN_LIST = enumToArray(GroupsColumns)
export const GROUPS_COLUMNS = enumToObject(GroupsColumns)

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const curator = await User.findOne(createGroupDto.curatorId)

    const checkName = await this.groupsRepository
      .createQueryBuilder('group')
      .andWhere(`LOWER(group.name) LIKE LOWER(:name)`, { name: `%${createGroupDto.name}%` })
      .getOne()

    if (checkName) {
      throw new BadRequestException(`Група з назвою: ${createGroupDto.name} вже існує.`)
    }

    if (!curator || curator.role !== ROLE.CURATOR) {
      throw new BadRequestException(`Не знайдено куратора з id: ${createGroupDto.curatorId}`)
    }

    const group = await this.groupsRepository
      .create({
        ...createGroupDto,
        curator,
      })
      .save({ data: { id: sub } })

    return plainToClass(CreateGroupResponseDto, group, {
      excludeExtraneousValues: true,
    })
  }

  async findAllWithPagination(
    options: IPaginationOptions,
    search: string,
    orderByColumn: GroupsColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    curatorId: number,
    orderNumber: string,
    deletedOrderNumber: string,
  ) {
    orderByColumn = orderByColumn || GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GROUPS_COLUMN_LIST, orderByColumn)

    const query = this.groupsRepository
      .createQueryBuilder('Group')
      .leftJoinAndSelect('Group.curator', 'User')
      .loadRelationCountAndMap('Group.students', 'Group.students', 'student')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")

    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(name), LOWER(User.firstName) , LOWER(User.lastName)  ,LOWER(concat("firstName",' ', "lastName")) ,"orderNumber","curatorId","deletedOrderNumber") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (name) {
      query.andWhere(`LOWER(Group.name) LIKE LOWER(:name)`, { name: `%${name}%` })
    }
    if (curatorId) {
      query.andWhere(`User.id=:curId`, { curId: curatorId })
    }
    if (orderNumber) {
      query.andWhere(`LOWER(Group.orderNumber) LIKE LOWER(:orderNumber)`, { orderNumber: `%${orderNumber}%` })
    }
    if (deletedOrderNumber) {
      query
        .andWhere("(Group.deletedOrderNumber  <> '') IS  TRUE")
        .orWhere(`LOWER(Group.deletedOrderNumber) LIKE :deletedOrderNumber`, {
          deletedOrderNumber: `%${deletedOrderNumber}%`,
        })
    }
    query.orderBy(`Group.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGroupResponseDto, query, options)
  }

  async findAllWithoutPagination(
    search: string,
    orderByColumn: GroupsColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    curatorId: number,
    orderNumber: string,
    deletedOrderNumber: string,
  ) {
    orderByColumn = orderByColumn || GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GROUPS_COLUMN_LIST, orderByColumn)

    const query = this.groupsRepository
      .createQueryBuilder('Group')
      .leftJoinAndSelect('Group.curator', 'User')
      .loadRelationCountAndMap('Group.students', 'Group.students', 'student')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")

    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(name), LOWER(User.firstName) , LOWER(User.lastName)  ,LOWER(concat("firstName",' ', "lastName")) ,"orderNumber","curatorId","deletedOrderNumber") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (name) {
      query.andWhere(`LOWER(Group.name) LIKE LOWER(:name)`, { name: `%${name}%` })
    }
    if (curatorId) {
      query.andWhere(`User.id=:curId`, { curId: curatorId })
    }
    if (orderNumber) {
      query.andWhere(`LOWER(Group.orderNumber) LIKE LOWER(:orderNumber)`, { orderNumber: `%${orderNumber}%` })
    }
    if (deletedOrderNumber) {
      query
        .andWhere("(Group.deletedOrderNumber  <> '') IS  TRUE")
        .orWhere(`LOWER(Group.deletedOrderNumber) LIKE :deletedOrderNumber`, {
          deletedOrderNumber: `%${deletedOrderNumber}%`,
        })
    }
    query.orderBy(`Group.${orderByColumn}`, orderBy)

    return plainToClass(GetGroupResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOne(id: number, token?: TokenDto): Promise<GetGroupResponseDto> {
    const group = await this.groupsRepository
      .createQueryBuilder('Group')
      .leftJoinAndSelect('Group.curator', 'User')
      .loadRelationCountAndMap('Group.students', 'Group.students', 'student')
      .andWhere({ id })
      .getOne()

    if (!group) {
      throw new NotFoundException(`Групу з id: ${id},не знайдено`)
    }

    return plainToClass(GetGroupResponseDto, group, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, updateGroupDto: UpdateExactFieldDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    if (
      await this.groupsRepository
        .createQueryBuilder()
        .where(`LOWER(name) = LOWER(:name)`, { name: updateGroupDto.name })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`Група з назвою: ${updateGroupDto.name} вже існує.`)
    }

    const group = await this.groupsRepository.findOne(id)

    if (!group) {
      throw new NotFoundException(`Групу з id: ${id},не знайдено`)
    }

    if (updateGroupDto.curatorId) {
      const curator = await User.findOne(updateGroupDto.curatorId)

      if (!curator || curator.role !== ROLE.CURATOR) {
        throw new BadRequestException(`Не знайдено куратора з id: ${updateGroupDto.curatorId}`)
      }

      if (!group) {
        throw new NotFoundException(`Група з назвою: ${updateGroupDto.name} вже існує.`)
      }

      Object.assign(group, { ...updateGroupDto, curator })
    }

    try {
      await group.save({ data: { id: sub } })
    } catch (e) {
      throw new NotAcceptableException('Не вишло зберегти групу. ' + e.message)
    }

    return {
      success: true,
    }
  }

  async remove(id: number, token: TokenDto): Promise<DeleteResponseDto> {
    const { sub } = token
    const group = await this.groupsRepository.findOne(id)

    if (!group) {
      throw new NotFoundException(`Група з id: ${id} не знайдений`)
    }

    await this.groupsRepository.remove(group, {
      data: {
        id: sub,
      },
    })

    return {
      success: true,
    }
  }

  async dropdownName(name: string, teacherId: number, curatorId: number) {
    const query = await this.groupsRepository
      .createQueryBuilder('Group')
      .leftJoinAndSelect('Group.curator', 'User')
      .leftJoin('Group.courses', 'Course')
      .orWhere("(Group.deletedOrderNumber  <> '') IS NOT TRUE")

    if (name) {
      query
        .andWhere("(Group.deletedOrderNumber  <> '') IS  TRUE")
        .orWhere(`LOWER(Group.name) LIKE LOWER(:name)`, { name: `%${name}%` })
    }

    if (teacherId) {
      query.andWhere('Course.teacherId=:teacherId', { teacherId })
    }

    if (curatorId) {
      query.andWhere('User.id=:curatorId', { curatorId })
    }

    return plainToClass(CreateGroupResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async dropdownCurators() {
    const query = await User.createQueryBuilder().where('LOWER(User.role) = LOWER(:role)', { role: ROLE.CURATOR })
    return plainToClass(GetUserDropdownResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }
}
