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

  async create(createGroupDto: CreateGroupDto) {
    const curator = await User.findOne(createGroupDto.curatorId)

    if (!curator || curator.role !== ROLE.CURATOR) {
      throw new BadRequestException(`This curator id: ${createGroupDto.curatorId} not found.`)
    }

    const group = await this.groupsRepository
      .create({
        ...createGroupDto,
        curator,
      })
      .save()

    return plainToClass(CreateGroupResponseDto, group, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
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

    const query = this.groupsRepository.createQueryBuilder('group').leftJoinAndSelect('group.curator', 'user')
    if (search) {
      query.where(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(name), LOWER(user.firstName) , LOWER(user.lastName)  ,LOWER(concat("firstName",' ', "lastName")) ,"orderNumber","curatorId","deletedOrderNumber") LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (name) {
      query.andWhere(`LOWER(group.name) LIKE LOWER('%${name}%')`)
    }
    if (curatorId) {
      query.where(`user.id=${curatorId}`)
    }
    if (orderNumber) {
      query.andWhere(`LOWER(group.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }
    if (deletedOrderNumber) {
      query.andWhere(`LOWER(group.deletedOrderNumber) LIKE '%NULL%'`)
    }
    query.orderBy(`group.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGroupResponseDto, query, options)
  }

  async findOne(id: number, token?: TokenDto): Promise<GetGroupResponseDto> {
    const group = await this.groupsRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.curator', 'user')
      .andWhere({ id })
      .getOne()
    if (!group) {
      throw new NotFoundException(`Not found group id: ${id}`)
    }

    return plainToClass(GetGroupResponseDto, group)
  }

  async update(id: number, updateGroupDto: UpdateExactFieldDto) {
    if (
      await this.groupsRepository
        .createQueryBuilder()
        .where(`LOWER(name) = LOWER(:name)`, { name: updateGroupDto.name })
        .andWhere({ id: Not(id) })
        .getOne()
    ) {
      throw new BadRequestException(`This group name: ${updateGroupDto.name} already exist.`)
    }

    const group = await this.groupsRepository.findOne(id)
    if (!group) {
      throw new NotFoundException(`Not found group id: ${id}`)
    }

    Object.assign(group, updateGroupDto)
    try {
      await group.save({
        data: {
          group,
        },
      })
    } catch (e) {
      throw new NotAcceptableException("Can't save group. " + e.message)
    }

    return {
      success: true,
    }
  }
}
