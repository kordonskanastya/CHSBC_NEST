import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
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
import { AuthService } from '../../auth/auth.service'
import { GetGroupResponseDto } from './dto/get-group-response.dto'

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
    @Inject(forwardRef(() => AuthService))
    private groupsRepository: Repository<Group>,
    private authService: AuthService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    console.log(createGroupDto)
    const group = await this.groupsRepository.create(createGroupDto).save()
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
    curator_id: string,
    orderNumber: string,
    deleted0rderNumber: string,
  ) {
    orderByColumn = orderByColumn || GroupsColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(GROUPS_COLUMN_LIST, orderByColumn)

    const query = this.groupsRepository.createQueryBuilder('group').leftJoinAndSelect('group.curatorId', 'user')

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(group.name), LOWER(group.orderNumber),LOWER(group.curatorId),LOWER(group.deleted0rderNumber)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }
    if (name) {
      query.andWhere(`LOWER(group.name) LIKE LOWER('%${name}%')`)
    }
    if (orderNumber) {
      query.andWhere(`LOWER(group.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }
    if (deleted0rderNumber) {
      query.andWhere(`LOWER(group.deletedOrderNumber) LIKE '%NULL%'`)
    }
    query.orderBy(`group.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetGroupResponseDto, query, options)
  }

  async findOne(id: number, token?: TokenDto): Promise<GetGroupResponseDto> {
    const group = await this.groupsRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.curatorId', 'user')
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
