import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { USER_COLUMN_LIST, UserColumns, UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CreateUserResponseDto } from './dto/create-user-response.dto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { GetUserResponseDto } from './dto/get-user-response.dto'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { DeleteResponseDto } from '../common/dto/delete-response.dto'
import { ROLE, ROLE_LIST } from '../../auth/roles/role.enum'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { MinRole } from '../../auth/roles/roles.decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { Entities } from '../common/enums'
import { capitalize } from '../../utils/common'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { GetUserDropdownResponseDto } from './dto/get-user-dropdown-response.dto'
import { GetGroupResponseDto } from '../groups/dto/get-group-response.dto'
import { GetCoursesByTeacherDto } from './dto/get-courses-by-teacher.dto'
import { GetCourseResponseDto } from '../courses/dto/get-course-response.dto'

@Controller(Entities.USERS)
@ApiTags(capitalize(Entities.USERS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.STUDENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @MinRole(ROLE.ADMIN)
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Request() req, @Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    return await this.usersService.create(createUserDto, req.user)
  }

  @Get()
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetUserResponseDto, {
    description: 'Find all users',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: UserColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'name', required: false },
    { name: 'firstName', required: false },
    { name: 'lastName', required: false },
    { name: 'patronymic', required: false },
    { name: 'email', required: false },
    { name: 'role', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: UserColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('name') name: string,
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('patronymic') patronymic: string,
    @Query('email') email: string,
    @Query('role') role: string,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Invalid limit. Must be in the range 1 - 100.')
    }

    return await this.usersService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      name,
      firstName,
      lastName,
      patronymic,
      email,
      role,
    )
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({ description: 'Find user', type: GetUserResponseDto })
  async findOne(@Param('id') id: number, @Request() req): Promise<GetUserResponseDto> {
    return await this.usersService.findOne(id, req.user)
  }

  @Patch(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  @ApiOkResponse({ description: 'Update user (only admin)' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResponseDto> {
    return await this.usersService.update(id, updateUserDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  @ApiOkResponse({ description: 'Remove user (only admin)' })
  async remove(@Request() req, @Param('id') id: number): Promise<DeleteResponseDto> {
    return await this.usersService.remove(id, req.user.sub)
  }

  @Get('roles')
  @ApiOkResponse({ type: [String], description: 'Get user roles' })
  role() {
    return ROLE_LIST
  }

  @Get('order-columns')
  @ApiOkResponse({ type: [String], description: 'Get user columns' })
  orderColumns() {
    return USER_COLUMN_LIST
  }

  @Get('profile')
  @ApiOkResponse({ type: GetUserResponseDto, description: 'Get user profile' })
  async getProfile(@Request() req): Promise<GetUserResponseDto> {
    return await this.usersService.findOne(req.user.sub, req.user)
  }

  @Get('dropdown/teacher')
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetUserDropdownResponseDto, {
    description: 'Find teachers full names (ПІБ) for dropdown filter',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'teacherName', required: false },
  ])
  async dropdownTeacher(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('teacherName') teacherName: string,
  ) {
    return await this.usersService.dropdownTeacher(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      teacherName,
    )
  }

  @Get('dropdown/curator')
  @MinRole(ROLE.ADMIN)
  @ApiOkResponse({
    description: 'Find curators full names (ПІБ) for dropdown filter',
    type: GetUserDropdownResponseDto,
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'curatorName', required: false },
  ])
  async dropdownCurator(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('curatorName') curatorName: string,
  ): Promise<GetUserDropdownResponseDto[]> {
    return await this.usersService.dropdownCurator(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      curatorName,
    )
  }

  @Get('dropdown/admin')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({
    description: 'Find admins full names (ПІБ) for dropdown filter',
    type: GetUserDropdownResponseDto,
  })
  async dropdownAdmin(): Promise<GetUserDropdownResponseDto[]> {
    return await this.usersService.dropdownAdmin()
  }

  @Get('dropdown/student')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({
    description: 'Find students full names (ПІБ) for dropdown filter',
    type: GetUserDropdownResponseDto,
  })
  async dropdownStudent(): Promise<GetUserDropdownResponseDto[]> {
    return await this.usersService.dropdownStudent()
  }

  @Get('/curator/groups')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetGroupResponseDto, {
    description: 'Find all groups by curator',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
  ])
  async findGroupByCurator(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.usersService.getGroupsByCurator(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
    )
  }

  @Get('/curator/dropdown/groups')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetGroupResponseDto, {
    description: 'Find all groups by curator',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'name', required: false, description: 'group name' },
  ])
  async curatorGroupNameDropdown(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('name') groupName: string,
  ) {
    return await this.usersService.dropdownGroupName(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      groupName,
    )
  }

  @Get('/teacher/courses')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetCoursesByTeacherDto, {
    description: 'Find all courses by teacher',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
  ])
  async findCoursesByTeacher(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.usersService.getCoursesByTeacher(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
    )
  }

  @Get('/teacher/dropdown/courses')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetCourseResponseDto, {
    description: 'Find all courses by teacher',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'courseName', required: false, description: 'course name' },
  ])
  async teacherCoursesNameDropdown(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('courseName') courseName: string,
  ) {
    return await this.usersService.teacherDropdownCourseName(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.COURSES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      courseName,
    )
  }

  @Get('/teacher/dropdown/groups')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetGroupResponseDto, {
    description: 'Find all groups by teacher',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'name', required: false, description: 'group name' },
  ])
  async teacherGroupNameDropdown(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('name') groupName: string,
  ) {
    return await this.usersService.teacherDropdownGroupName(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GROUPS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      groupName,
    )
  }

  @Get('/teacher/dropdown/compulsory')
  @MinRole(ROLE.ADMIN)
  async teacherCompulsoryDropdown() {
    return await this.usersService.teacherDropdownCompulsory()
  }
}
