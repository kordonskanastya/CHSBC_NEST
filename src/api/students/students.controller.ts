import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  BadRequestException,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common'
import { StudentColumns, StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { MinRole } from '../../auth/roles/roles.decorator'
import {
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
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

@Controller(Entities.STUDENTS)
@ApiTags(capitalize(Entities.STUDENTS))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

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
    @Query('group') group: string,
    @Query('orderNumber') orderNumber: string,
    @Query('edeboId') edeboId: string,
    @Query('isFullTime') isFullTime: boolean,
    @Request() req,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Invalid limit. Must be in the range 1 - 100.')
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
      group,
      orderNumber,
      edeboId,
      isFullTime,
      req.user,
    )
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  @ApiOkResponse({ description: 'Find student', type: GetStudentResponseDto })
  async findOne(@Param('id') id: string, @Request() req): Promise<GetStudentResponseDto> {
    return this.studentsService.findOne(+id, req.user)
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
}
