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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { StudentColumns, StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { MinRole } from '../../auth/roles/roles.decorator'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ROLE } from '../../auth/roles/role.enum'
import { CreateStudentResponseDto } from './dto/create-student-response.dto'
import { GetStudentResponseDto } from './dto/get-student-response.dto'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { Entities } from '../common/enums'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { DeleteResponseDto } from '../common/dto/delete-response.dto'
import { capitalize } from '../../utils/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { GetUserDropdownResponseDto } from '../users/dto/get-user-dropdown-response.dto'
import { VotingService } from '../voting/voting.service'
import { VoteStudentDto } from '../voting/dto/vote-student.dto'

@Controller(Entities.STUDENTS)
@ApiTags(capitalize(Entities.STUDENTS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService, private readonly votingService: VotingService) {}

  @Post()
  @MinRole(ROLE.ADMIN)
  @ApiCreatedResponse({ type: CreateStudentResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Request() req, @Body() createStudentDto: CreateStudentDto): Promise<CreateStudentResponseDto> {
    return await this.studentsService.create(createStudentDto, req.user)
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: false }))
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetStudentResponseDto, {
    description: 'Find all students',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: StudentColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'id', required: false },
    { name: 'firstName', required: false },
    { name: 'lastName', required: false },
    { name: 'patronymic', required: false },
    { name: 'email', required: false },
    { name: 'group', required: false },
    { name: 'orderNumber', required: false },
    { name: 'edeboId', required: false },
    { name: 'isFullTime', required: false },
  ])
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: StudentColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('id') id: number,
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('email') email: string,
    @Query('patronymic') patronymic: string,
    @Query('group') group: number,
    @Query('orderNumber') orderNumber: string,
    @Query('edeboId') edeboId: string,
    @Query('isFullTime') isFullTime: boolean,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Неправильний ліміт. Має бути від 1 до 100.')
    }

    return this.studentsService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.STUDENTS}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      id,
      firstName,
      lastName,
      patronymic,
      email,
      group,
      orderNumber,
      edeboId,
      isFullTime,
    )
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({ description: 'Find student', type: GetStudentResponseDto })
  async findOne(@Param('id') id: string): Promise<GetStudentResponseDto> {
    return this.studentsService.findOne(+id)
  }

  @Patch(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  @ApiOkResponse({ description: 'Update student (only admin)' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  update(@Request() req, @Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  @ApiOkResponse({ description: 'Remove student (only admin)' })
  async remove(@Request() req, @Param('id') id: string): Promise<DeleteResponseDto> {
    return this.studentsService.remove(+id, req.user.sub)
  }

  @Get('dropdown/name')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({
    description: 'Find students full names (ПІБ) for dropdown filter',
    type: GetUserDropdownResponseDto,
  })
  @ApiImplicitQueries([
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: StudentColumns },
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
  ])
  async dropdownStudent(
    @Query('page') page = 1,
    @Query('orderByColumn') orderByColumn: StudentColumns,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
  ) {
    return await this.studentsService.dropdownStudent(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.STUDENTS}/dropdown/name`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      orderBy,
      orderByColumn,
    )
  }

  @Get('page/voting')
  @MinRole(ROLE.STUDENT)
  async getVotingForStudent(@Request() req) {
    return await this.votingService.getVotingForStudent(req.user)
  }

  @Post('page/voting')
  @MinRole(ROLE.STUDENT)
  async postVotingForStudent(@Request() req, @Body() voteStudentDto: VoteStudentDto) {
    return await this.votingService.postVotingForStudent(voteStudentDto, req.user)
  }
}
