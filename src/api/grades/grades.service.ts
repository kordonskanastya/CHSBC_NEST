import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateGradeDto } from './dto/create-grade.dto'
import { UpdateGradeDto } from './dto/update-grade.dto'
import { GRADE_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Grade } from './entities/grade.entity'
import { plainToClass } from 'class-transformer'
import { CreateGroupResponseDto } from '../groups/dto/create-group-response.dto'
import { TokenDto } from '../../auth/dto/token.dto'
import { Course } from '../courses/entities/course.entity'
import { Student } from '../students/entities/student.entity'

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const student = await Student.findOne(createGradeDto.studentId)
    const course = await Course.findOne(createGradeDto.courseId)

    if (!student) {
      throw new BadRequestException(`This student id: ${createGradeDto.studentId} not found.`)
    }

    if (!course) {
      throw new BadRequestException(`This course id: ${createGradeDto.courseId} not found.`)
    }

    const grade = await this.gradeRepository
      .create({
        ...createGradeDto,
        student,
        course,
      })
      .save({ data: { id: sub } })

    return plainToClass(CreateGroupResponseDto, grade, {
      excludeExtraneousValues: true,
    })
  }

  async findAll() {
    return await `This action returns all grades`
  }

  async findOne(id: number) {
    return await `This action returns a #${id} grade`
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    return await `This action updates a #${id} grade`
  }

  async remove(id: number) {
    return await `This action removes a #${id} grade`
  }
}
