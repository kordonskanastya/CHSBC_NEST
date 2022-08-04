import { BadRequestException, Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { LOGGER_COLUMN_LIST, LoggerColumns, LoggersService } from './loggers.service'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { Entities } from '../common/enums'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { capitalize } from '../../utils/common'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { GetLoggerResponseDto } from './dto/get-logger-response.dto'
import { PaginatedDto } from '../common/dto/paginate.dto'
import { GetLoggerOneResponseDto } from './dto/get-logger-one-response.dto'
import { SubscriberEventTypes } from './entities/logger-subscriber'

@Controller(Entities.LOGGERS)
@ApiTags(capitalize(Entities.LOGGERS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiExtraModels(PaginatedDto)
export class LoggersController {
  constructor(private readonly loggersService: LoggersService) {}

  @Get()
  @ApiPaginatedResponse(GetLoggerResponseDto, {
    description: 'Find all logs',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: LoggerColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'event', required: false, enum: SubscriberEventTypes },
    { name: 'entity', required: false, enum: Entities },
    { name: 'entityId', required: false },
    { name: 'user', required: false },
    { name: 'userId', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: LoggerColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('event') event: string,
    @Query('entity') entity: string,
    @Query('entityId') entityId: number,
    @Query('user') user: string,
    @Query('userId') userId: number,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Неправильний ліміт. Має бути від 1 до 100.')
    }

    return await this.loggersService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.LOGGERS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderByColumn,
      orderBy,
      event,
      entity,
      entityId,
      user,
      userId,
    )
  }

  @Get(':id([0-9]+)')
  @ApiOkResponse({ type: GetLoggerOneResponseDto })
  findOne(@Param('id') id: number) {
    return this.loggersService.findOne(id)
  }

  @Get('order-columns')
  @ApiOkResponse({ type: [String], description: 'Get logger columns' })
  orderColumns() {
    return LOGGER_COLUMN_LIST
  }
}
