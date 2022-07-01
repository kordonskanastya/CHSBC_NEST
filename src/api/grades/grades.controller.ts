import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { GradeColumns, GradesService } from './grades.service'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CreateGradeResponseDto } from './dto/create-grade-response.dto'
import { Entities } from '../common/enums'
import { capitalize } from '../../utils/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { GetGradeResponseDto } from './dto/get-grade-response.dto'

@Controller(Entities.GRADES)
@ApiTags(capitalize(Entities.GRADES))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @MinRole(ROLE.TEACHER)
  @ApiCreatedResponse({ type: CreateGradeResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Body() createGradeDto: CreateGradeDto): Promise<CreateGradeResponseDto> {
    return await this.gradesService.create(createGradeDto)
  }

  @Get()
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetGradeResponseDto, {
    description: 'Find all grades',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: GradeColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'studentId', required: false },
    { name: 'courseId', required: false },
    { name: 'grade', required: false },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: GradeColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('studentId') studentId: number,
    @Query('courseId') courseId: number,
    @Query('grade') grade: number,
  ) {
    return await this.gradesService.findAll(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.GRADES}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      orderByColumn,
      orderBy,
      studentId,
      courseId,
      grade,
    )
  }

  @Get(':id')
  @ApiImplicitQueries([{ name: 'id', required: false, description: 'Input student id' }])
  async findOne(@Query('id') id: string) {
    return await this.gradesService.findOne(+id)
  }

  @Patch(':id')
  @ApiImplicitQueries([{ name: 'id', required: false, description: 'Input student id' }])
  async update(@Query('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return await this.gradesService.update(+id, updateGradeDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.gradesService.remove(+id)
  }
}
