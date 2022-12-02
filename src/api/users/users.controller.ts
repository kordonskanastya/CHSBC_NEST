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
import { GetTeacherCoursesDto } from './dto/get-teacher-courses.dto'
import { GradeColumns, GradesService } from '../grades/grades.service'
import { UpdateGradeDto } from '../grades/dto/update-grade.dto'
import { SEMESTER } from '../courses/courses.service'
import { StudentColumns } from '../students/students.service'

@Controller(Entities.USERS)
@ApiTags(capitalize(Entities.USERS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.STUDENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly gradesService: GradesService) {}

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
    { name: 'id', required: false },
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
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('patronymic') patronymic: string,
    @Query('email') email: string,
    @Query('role') role: string,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Неправильний ліміт. Має бути від 1 до 100.')
    }

    return await this.usersService.findAllWithPagination(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      id,
      name,
      firstName,
      lastName,
      patronymic,
      email,
      role,
    )
  }

  @Get('without-pagination')
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetUserResponseDto, {
    description: 'Find all users',
  })
  @ApiImplicitQueries([
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: UserColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'id', required: false },
    { name: 'name', required: false },
    { name: 'firstName', required: false },
    { name: 'lastName', required: false },
    { name: 'patronymic', required: false },
    { name: 'email', required: false },
    { name: 'role', required: false },
  ])
  async findAllWithoutPagination(
    @Query('orderByColumn') orderByColumn: UserColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('patronymic') patronymic: string,
    @Query('email') email: string,
    @Query('role') role: string,
  ) {
    return await this.usersService.findAllWithoutPagination(
      search,
      orderByColumn,
      orderBy,
      id,
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
  async dropdownTeacher() {
    return await this.usersService.dropdownTeacher()
  }

  @Get('dropdown/admin')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({
    description: 'Find admins full names (ПІБ) for dropdown filter',
    type: GetUserDropdownResponseDto,
  })
  async dropdownAdmin() {
    return await this.usersService.dropdownAdmin()
  }

  @Get('/curator')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetGroupResponseDto, {
    description: 'Find all groups by curator',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: UserColumns },
    { name: 'curatorId', required: false, description: 'curator`s id' },
    { name: 'groupName', required: false, description: 'group`s name' },
  ])
  async findGroupByCurator(
    @Query('curatorId') curatorId: number,
    @Query('groupName') groupName: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('orderByColumn') orderByColumn: UserColumns,
  ) {
    return await this.usersService.getCuratorsGroups(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}/curator`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      groupName,
      curatorId,
      orderBy,
      orderByColumn,
    )
  }

  @Get('/teacher')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetTeacherCoursesDto, {
    description: 'Find all courses by teacher',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: UserColumns },
    { name: 'teacherId', required: false },
    { name: 'groups', required: false, type: 'array' },
    { name: 'courses', required: false, type: 'array' },
  ])
  async findCoursesByTeacher(
    @Query('teacherId') teacherId: number,
    @Query('groups') groups: number[],
    @Query('courses') courses: number[],
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('orderByColumn') orderByColumn: UserColumns,
  ) {
    return await this.usersService.getCoursesByTeacher(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}/teacher`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      orderByColumn,
      teacherId,
      groups,
      courses,
    )
  }

  @Get('/curator/page')
  @MinRole(ROLE.CURATOR)
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: StudentColumns },
    { name: 'groupId', required: false },
    { name: 'studentId', required: false },
    { name: 'semester', required: false },
  ])
  async findCuratorInfo(
    @Request() req,
    @Query('studentId') studentId: number,
    @Query('groupId') groupId: number,
    @Query('semester') semester: SEMESTER,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('orderByColumn') orderByColumn: StudentColumns,
  ) {
    return await this.usersService.getCuratorInfo(
      req.user,
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}/curator/page`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      orderByColumn,
      studentId,
      groupId,
      semester,
    )
  }

  @Get('/teacher/page')
  @MinRole(ROLE.TEACHER)
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: StudentColumns },
    { name: 'groupId', required: false },
    { name: 'courseId', required: false },
    { name: 'studentId', required: false },
  ])
  async findTeacherInfo(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('orderByColumn') orderByColumn: GradeColumns,
    @Query('studentId') studentId: number,
    @Query('groupId') groupId: number,
    @Query('courseId') courseId: number,
  ) {
    return await this.usersService.getTeacherInfo(
      req.user,
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.USERS}/teacher/page`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      orderByColumn,
      studentId,
      groupId,
      courseId,
    )
  }

  @Get('/teacher/page/:id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  async findTeacherInfoById(@Param('id') id: number) {
    return this.gradesService.findOne(id)
  }

  @Patch('/teacher/page/student/:id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  async patchTeacherInfoById(@Param('id') id: number, @Body() updateTeacherInfo: UpdateGradeDto, @Request() req) {
    return this.gradesService.update(id, updateTeacherInfo, req.user)
  }
}
