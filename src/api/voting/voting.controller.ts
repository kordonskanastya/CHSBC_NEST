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
import { VotingColumns, VotingService, VotingStatus } from './voting.service'
import { CreateVotingDto } from './dto/create-voting.dto'
import { UpdateVotingDto } from './dto/update-voting.dto'
import { Entities } from '../common/enums'
import { ApiBearerAuth, ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { capitalize } from '../../utils/common'
import { MinRole } from '../../auth/roles/roles.decorator'
import { ROLE } from '../../auth/roles/role.enum'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { RolesGuard } from '../../auth/roles/roles.guard'
import { ApiPaginatedResponse } from '../../utils/paginate'
import { GetVotingDto } from './dto/get-voting.dto'
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator'
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { CreateStudentVoteDto } from './dto/create-student-vote.dto'

@Controller(Entities.VOTING)
@ApiTags(capitalize(Entities.VOTING))
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
@MinRole(ROLE.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post()
  @MinRole(ROLE.ADMIN)
  async create(@Request() req, @Body() createVotingDto: CreateVotingDto) {
    return await this.votingService.create(createVotingDto, req.user)
  }

  @Get()
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetVotingDto, {
    description: 'Find all courses',
  })
  @ApiImplicitQueries([
    { name: 'page', required: false, description: 'default 1' },
    { name: 'limit', required: false, description: 'default 10, min 1 - max 100' },
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: VotingColumns },
    { name: 'search', required: false },
    { name: 'id', required: false },
    { name: 'name', required: false },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'groups', required: false, type: 'array' },
    { name: 'startDate', required: false, type: 'startDate' },
    { name: 'endDate', required: false, type: 'endDate' },
    { name: 'requiredCourses', required: false, type: 'array' },
    { name: 'notRequiredCourses', required: false, type: 'array' },
    { name: 'status', required: false, enum: VotingStatus },
  ])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('orderByColumn') orderByColumn: VotingColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('groups') groups: number[],
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('requiredCourses') requiredCourses: number[],
    @Query('notRequiredCourses') notRequiredCourses: number[],
    @Query('status') status: VotingStatus,
  ) {
    if (limit <= 0) {
      throw new BadRequestException('Не правильний ліміт має бути 1 - 100.')
    }
    return await this.votingService.findAllWithPagination(
      {
        page,
        limit: Math.min(limit, 100),
        route: `/${Entities.VOTING}`,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
      search,
      id,
      orderByColumn,
      orderBy,
      name,
      groups,
      startDate,
      endDate,
      requiredCourses,
      notRequiredCourses,
      status,
    )
  }

  @Get('without-pagination')
  @MinRole(ROLE.ADMIN)
  @ApiPaginatedResponse(GetVotingDto, {
    description: 'Find all courses',
  })
  @ApiImplicitQueries([
    { name: 'orderByColumn', required: false, description: 'default "id", case-sensitive', enum: VotingColumns },
    { name: 'search', required: false },
    { name: 'id', required: false },
    { name: 'name', required: false },
    { name: 'orderBy', required: false, description: 'default "ASC"' },
    { name: 'groups', required: false, type: 'array' },
    { name: 'startDate', required: false, type: 'startDate' },
    { name: 'endDate', required: false, type: 'endDate' },
    { name: 'requiredCourses', required: false, type: 'array' },
    { name: 'notRequiredCourses', required: false, type: 'array' },
    { name: 'status', required: false, enum: VotingStatus },
  ])
  async findAllWithoutPagination(
    @Query('orderByColumn') orderByColumn: VotingColumns,
    @Query('orderBy') orderBy: 'ASC' | 'DESC',
    @Query('search') search: string,
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('groups') groups: number[],
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('requiredCourses') requiredCourses: number[],
    @Query('notRequiredCourses') notRequiredCourses: number[],
    @Query('status') status: VotingStatus,
  ) {
    return await this.votingService.findAllWithoutPagination(
      search,
      id,
      orderByColumn,
      orderBy,
      name,
      groups,
      startDate,
      endDate,
      requiredCourses,
      notRequiredCourses,
      status,
    )
  }

  @Get(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.votingService.findOne(+id)
  }

  @Patch(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async update(@Request() req, @Param('id') id: string, @Body() updateVotingDto: UpdateVotingDto) {
    return await this.votingService.update(+id, updateVotingDto, req.user)
  }

  @Delete(':id([0-9]+)')
  @MinRole(ROLE.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return await this.votingService.remove(+id, req.user)
  }

  @Get(':id([0-9]+)/result')
  @MinRole(ROLE.ADMIN)
  async findOneVotingResult(@Param('id') id: string) {
    return await this.votingService.findOneVotingResult(+id)
  }

  @Post(':id([0-9]+)/courses/submit')
  @MinRole(ROLE.ADMIN)
  async submitCoursesToStudentsByVoteId(
    @Param('id') voteId: string,
    @Body() submitCourseDto: CreateStudentVoteDto,
    @Request() req,
  ) {
    return await this.votingService.submitCourseByVoteId(submitCourseDto.courses, req.user, +voteId)
  }

  @Get(':id([0-9]+)/submit-form')
  @MinRole(ROLE.ADMIN)
  async getSubmitCoursesForm(@Param('id') id: string) {
    return await this.votingService.getSubmitCoursesForm(+id)
  }
}
