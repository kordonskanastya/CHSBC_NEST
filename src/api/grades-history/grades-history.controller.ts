import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { GradesHistoryColumns, GradesHistoryService } from './grades-history.service'
import { Entities } from '../common/enums'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { capitalize } from '../../utils/common'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { GetGradesHistoryResponseDto } from './dto/get-grades-history-response.dto'
import { CreateGradesHistoryDto } from './dto/create-grades-history.dto'
import { GroupsColumns } from '../groups/groups.service'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'

@Controller(Entities.GRADES_HISTORY)
@ApiTags(capitalize(Entities.GRADES_HISTORY))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesHistoryController {
  constructor(private readonly gradesHistoryService: GradesHistoryService) {}

  @Post()
  @ApiCreatedResponse({ type: CreateGradesHistoryDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Request() req, @Body() createGradesHistoryDto: CreateGradesHistoryDto) {
    return await this.gradesHistoryService.create(createGradesHistoryDto, req.user)
  }

  @Get()
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetGradesHistoryResponseDto, {
    description: 'Get grades history response dto',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: GroupsColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'name', required: false },
    { name: 'courseId', required: false },
    { name: 'studentId', required: false },
    { name: 'userId', required: false },
    { name: 'grade', required: false },
    { name: 'reason', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: GradesHistoryColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('studentId') studentId: number,
    @Query('userId') userId: number,
    @Query('courseId') courseId: number,
    @Query('grade') grade: number,
  ) {
    return await this.gradesHistoryService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GRADES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderByColumn,
      orderBy,
      studentId,
      userId,
      courseId,
      grade,
    )
  }
}
