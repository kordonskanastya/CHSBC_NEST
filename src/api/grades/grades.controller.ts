import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { GradesService } from './grades.service'
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
  async findAll() {
    return await this.gradesService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.gradesService.findOne(+id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return await this.gradesService.update(+id, updateGradeDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.gradesService.remove(+id)
  }
}
