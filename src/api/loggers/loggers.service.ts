import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Logger } from './entities/logger.entity'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { plainToClass } from 'class-transformer'
import { LOGGER_REPOSITORY } from '../../constants'
import { GetLoggerResponseDto } from './dto/get-logger-response.dto'
import { GetLoggerOneResponseDto } from './dto/get-logger-one-response.dto'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { Entities } from '../common/enums'

export enum LoggerColumns {
  ID = 'id',
  EVENT = 'event',
  ENTITY = 'entity',
  CREATED = 'created',
  UPDATED = 'updated',
}

export const LOGGER_COLUMN_LIST = enumToArray(LoggerColumns)
export const LOGGER_COLUMNS = enumToObject(LoggerColumns)

@Injectable()
export class LoggersService {
  constructor(
    @Inject(LOGGER_REPOSITORY)
    private loggersRepository: Repository<Logger>,
  ) {}

  selectLogs() {
    return this.loggersRepository.createQueryBuilder().leftJoinAndSelect('Logger.user', 'User')
  }

  async findAll(
    options: IPaginationOptions,
    orderByColumn: LoggerColumns,
    orderBy: 'ASC' | 'DESC',
    event: string,
    entity: string,
    entityId: number,
    user: string,
    userId: number,
  ) {
    orderByColumn = orderByColumn || LoggerColumns.CREATED
    orderBy = orderBy || 'ASC'

    checkColumnExist(LOGGER_COLUMN_LIST, orderByColumn)

    const query = this.selectLogs()

    if (event) {
      query.andWhere(`(Logger.event) ILIKE (:event)`, { event: `%${event}%` })
    }

    if (entity) {
      query.andWhere(`(Logger.entity) ILIKE (:entity)`, { entity: `%${entity}%` })
    }

    if (entityId) {
      query.andWhere(`Logger.entityId = :entityId`, { entityId })
    }

    if (userId) {
      query.andWhere(`User.id = :userId`, { userId })
    }

    query.orderBy(`Logger.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetLoggerResponseDto, query, options)
  }

  async findAllRaw(entity: Entities, entityId: number) {
    return await this.selectLogs().where({ entity }).andWhere({ entityId }).getMany()
  }

  async findOne(id: number) {
    const log = await this.selectLogs().andWhere({ id }).getOne()

    if (!log) {
      throw new NotFoundException(`Лог з id: ${id} не знайдений`)
    }

    return plainToClass(GetLoggerOneResponseDto, log, {
      excludeExtraneousValues: true,
    })
  }
}
