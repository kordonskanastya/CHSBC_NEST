import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common'
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
import { GetUserDropdownResponseDto } from '../users/dto/get-user-dropdown-response.dto'

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
  async create(@Request() req, @Body() createGroupDto: CreateGroupDto): Promise<CreateGroupResponseDto> {
    return await this.groupsService.create(createGroupDto, req.user)
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
  async findAllWithPagination(
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
    return await this.groupsService.findAllWithPagination(
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

  @Get('without-pagination')
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
  async findAllWithoutPagination(
    @Query('orderByColumn') orderByColumn: GroupsColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('name') name: string,
    @Query('curatorId') curatorId: number,
    @Query('orderNumber') orderNumber: string,
    @Query('deletedOrderNumber') deletedOrderNumber: string,
  ) {
    return await this.groupsService.findAllWithoutPagination(
      search,
      orderByColumn,
      orderBy,
      name,
      curatorId,
      orderNumber,
      deletedOrderNumber,
    )
  }

  @Get('dropdown/name')
  @MinRole(ROLE.STUDENT)
  @ApiPaginatedResponse(CreateGroupResponseDto, {
    description: 'get dropdown list',
  })
  @ApiImplicitQueries([
    { name: 'name', required: false },
    { name: 'teacherId', required: false },
    { name: 'curatorId', required: false },
  ])
  async dropdownName(
    @Query('name') name: string,
    @Query('teacherId') teacherId: number,
    @Query('curatorId') curatorId: number,
  ) {
    return await this.groupsService.dropdownName(name, teacherId, curatorId)
  }

  @Get('dropdown/curators')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetUserDropdownResponseDto, {
    description: 'get dropdown list',
  })
  @ApiImplicitQueries([])
  async dropdownCurator() {
    return await this.groupsService.dropdownCurators()
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  @ApiOkResponse({ description: 'Find group', type: CreateGroupResponseDto })
  findOne(@Param('id') id: string): Promise<CreateGroupResponseDto> {
    return this.groupsService.findOne(+id)
  }

  @Patch(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async update(@Request() req, @Param('id') id: string, @Body() updateGroupDto: UpdateExactFieldDto) {
    return await this.groupsService.update(+id, updateGroupDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async delete(@Request() req, @Param('id') id: string) {
    return await this.groupsService.remove(+id, req.user)
  }
}
