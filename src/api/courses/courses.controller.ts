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
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { ROLE } from '../../auth/roles/role.enum'
import { MinRole } from '../../auth/roles/roles.decorator'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { capitalize } from '../../utils/common'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { Entities } from '../common/enums'
import { CourseColumns, CoursesService } from './courses.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { GetCourseResponseDto } from './dto/get-course-response.dto'
import { UpdateCourseDto } from './dto/update-course.dto'

@Controller(Entities.COURSES)
@ApiTags(capitalize(Entities.COURSES))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @MinRole(ROLE.ADMIN)
  async create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    return await this.coursesService.create(createCourseDto, req.user)
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: false }))
  @MinRole(ROLE.STUDENT)
  @ApiPaginatedResponse(GetCourseResponseDto, {
    description: 'Find all courses',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: CourseColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'name', required: false },
    { name: 'credits', required: false },
    { name: 'lectureHours', required: false },
    { name: 'isExam', required: false },
    { name: 'isActive', required: false },
    { name: 'semester', required: false },
    { name: 'isCompulsory', required: false },
    { name: 'teacher', required: false },
    { name: 'groups', required: false, type: 'array' },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: CourseColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('name') name: string,
    @Query('credits') credits: number,
    @Query('lectureHours') lectureHours: number,
    @Query('isExam') isExam: boolean,
    @Query('isActive') isActive: boolean,
    @Query('semester') semester: number,
    @Query('isCompulsory') isCompulsory: boolean,
    @Query('teacher') teacher: number,
    @Query('groups') groups: number[],
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Invalid limit. Must be in the range 1 - 100.')
    }
    return await this.coursesService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.COURSES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      name,
      credits,
      lectureHours,
      isExam,
      isActive,
      semester,
      isCompulsory,
      teacher,
      groups,
    )
  }

  @Get(':id')
  @MinRole(ROLE.STUDENT)
  async findOne(@Param('id') id: string): Promise<GetCourseResponseDto> {
    return await this.coursesService.findOne(+id)
  }

  @Patch(':id')
  @MinRole(ROLE.ADMIN)
  async update(@Request() req, @Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return await this.coursesService.update(+id, updateCourseDto, req.user)
  }

  @Delete(':id')
  @MinRole(ROLE.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return await this.coursesService.remove(+id, req.user)
  }

  @Get('course/dropdown')
  @ApiOkResponse({ type: GetCourseResponseDto, description: 'Get course dropdown' })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'courseName', required: false, description: 'course name' },
  ])
  async getCoursesDropdown(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('courseName') courseName: string,
  ) {
    return await this.coursesService.getCoursesDropdown(
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
}
