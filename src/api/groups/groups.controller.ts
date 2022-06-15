import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { GroupsColumns, GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { Entities } from '../common/enums'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import { CreateGroupResponseDto } from './dto/create-group-response.dto'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { UpdateExactFieldDto } from './dto/update-exact-field.dto'
import { capitalize } from '../../utils/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { GetGroupResponseDto } from './dto/get-group-response.dto'

@Controller(Entities.GROUPS)
@ApiTags(capitalize(Entities.GROUPS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.STUDENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @MinRole(ROLE.ADMIN)
  @ApiCreatedResponse({ type: CreateGroupResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<CreateGroupResponseDto> {
    return await this.groupsService.create(createGroupDto)
  }

  @Get()
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetGroupResponseDto, {
    description: 'Find all groups',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: GroupsColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'name', required: false },
    { name: 'curatorId', required: false },
    { name: 'orderNumber', required: false },
    { name: 'deletedOrderNumber', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: GroupsColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('name') name: string,
    @Query('curatorId') curatorId: number,
    @Query('orderNumber') orderNumber: string,
    @Query('deletedOrderNumber') deletedOrderNumber: string,
  ) {
    return await this.groupsService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      name,
      curatorId,
      orderNumber,
      deletedOrderNumber,
    )
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  @ApiOkResponse({ description: 'Find group', type: CreateGroupResponseDto })
  async findOne(@Param('id') id: string): Promise<CreateGroupResponseDto> {
    return this.groupsService.findOne(+id)
  }

  @Get('quantity-students/:id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  @ApiOkResponse({ description: 'Get quantity students in group', type: Number })
  async getQuantityStudent(@Param('id') id: number) {
    return await this.groupsService.countGroupStudent(id)
  }

  @Patch(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async update(@Param('id') id: string, @Body() updateGroupDto: UpdateExactFieldDto) {
    return await this.groupsService.update(+id, updateGroupDto)
  }
}
