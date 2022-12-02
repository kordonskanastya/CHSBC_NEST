import { Body, Controller, Delete, Get, Param, Patch, Query, Request, Res, UseGuards } from '@nestjs/common'
import { GradeColumns, GradesService } from './grades.service'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import { ApiBearerAuth, ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Entities } from '../common/enums'
import { capitalize } from '../../utils/common'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { GetGradeResponseDto } from './dto/get-grade-response.dto'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'
import { SEMESTER } from '../courses/courses.service'

@Controller(Entities.GRADES)
@ApiTags(capitalize(Entities.GRADES))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.TEACHER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

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
    { name: 'groupId', required: false },
    { name: 'grade', required: false },
    { name: 'semester', required: false },
  ])
  async findAllWithPagination(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: GradeColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('studentId') studentId: number,
    @Query('courseId') courseId: number,
    @Query('groupId') groupId: number,
    @Query('grade') grade: number,
    @Query('semester') semester: SEMESTER,
  ) {
    return await this.gradesService.findAllWithPagination(
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
      groupId,
      grade,
      semester,
    )
  }

  @Get('without-pagination')
  @MinRole(ROLE.TEACHER)
  @ApiPaginatedResponse(GetGradeResponseDto, {
    description: 'Find all grades',
  })
  @ApiImplicitQueries([
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: GradeColumns },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'search', required: false },
    { name: 'studentId', required: false },
    { name: 'courseId', required: false },
    { name: 'groupId', required: false },
    { name: 'grade', required: false },
    { name: 'semester', required: false },
  ])
  async findAllWithoutPagination(
    @Query('orderByColumn') orderByColumn: GradeColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('studentId') studentId: number,
    @Query('courseId') courseId: number,
    @Query('groupId') groupId: number,
    @Query('grade') grade: number,
    @Query('semester') semester: SEMESTER,
  ) {
    return await this.gradesService.findAllWithOutPagination(
      search,
      orderByColumn,
      orderBy,
      studentId,
      courseId,
      groupId,
      grade,
      semester,
    )
  }

  @Get('/student/:id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  @ApiImplicitQueries([{ name: 'semester', required: false }])
  async findOne(@Param('id') id: string, @Query('semester') semester: SEMESTER) {
    return await this.gradesService.findOneGradeByStudent(+id, semester)
  }

  @Patch('/student/:id([0-9]+)')
  @MinRole(ROLE.TEACHER)
  async update(@Request() req, @Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return await this.gradesService.update(+id, updateGradeDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return await this.gradesService.remove(+id, req.user)
  }

  @Get('dropdown/group-name')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(CreateGroupResponseDto, {
    description: 'get dropdown list',
  })
  @ApiImplicitQueries([{ name: 'groupName', required: false }])
  async dropdownGroupName(@Query('groupName') groupName: string) {
    return await this.gradesService.dropdownGroup(groupName)
  }

  @Get('download-grades/student/:id([0-9]+)')
  @MinRole(ROLE.STUDENT)
  @ApiImplicitQueries([{ name: 'semester', required: false }])
  async downloadIndividualPlan(@Param('id') id: string, @Query('semester') semester: SEMESTER, @Res() res) {
    const pathToGradesFile = await this.gradesService.downloadStudentsGrades(+id, semester)
    return res.download(pathToGradesFile)
  }
}
