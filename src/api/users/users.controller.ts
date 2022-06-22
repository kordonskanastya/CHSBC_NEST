import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { UserColumns, USER_COLUMN_LIST, UsersService } from './users.service'
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
    { name: 'email', required: false },
    { name: 'role', required: false },
    { name: 'status', required: false },
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
    @Query('email') email: string,
    @Query('role') role: string,
    @Query() props,
    @Request() req,
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
      email,
      role,
      props.status,
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
}
