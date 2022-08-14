import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateVotingDto } from './dto/create-voting.dto'
import { UpdateVotingDto } from './dto/update-voting.dto'
import { TokenDto } from '../../auth/dto/token.dto'
import { VOTE_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Vote } from './entities/voting.entity'
import { Group } from '../groups/entities/group.entity'
import { Course } from '../courses/entities/course.entity'
import { plainToClass } from 'class-transformer'
import { CreateCourseResponseDto } from '../courses/dto/create-course-response.dto'

@Injectable()
export class VotingService {
  constructor(
    @Inject(VOTE_REPOSITORY)
    private votingRepository: Repository<Vote>,
  ) {}

  async create(createVotingDto: CreateVotingDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const groupIds = Array.isArray(createVotingDto.groups) ? createVotingDto.groups : [createVotingDto.groups]
    const groups = await Group.createQueryBuilder()
      .where(`Group.id IN (:...ids)`, {
        ids: groupIds,
      })
      .getMany()

    if (!groups || groups.length !== groupIds.length) {
      throw new BadRequestException(`Група з іd: ${createVotingDto.groups} не існує.`)
    }

    if (new Date(createVotingDto.startDate) > new Date(createVotingDto.endDate)) {
      throw new BadRequestException('Дата старту голосування не може бути пізніше,чим кінець голосування')
    }

    const requiredCoursesIds = Array.isArray(createVotingDto.requiredCourses)
      ? createVotingDto.requiredCourses
      : [createVotingDto.requiredCourses]
    const notRequiredCoursesIds = Array.isArray(createVotingDto.notRequiredCourses)
      ? createVotingDto.notRequiredCourses
      : [createVotingDto.notRequiredCourses]

    if (requiredCoursesIds.length === 0 || notRequiredCoursesIds.length === 0) {
      throw new BadRequestException(`Херня`)
    }

    const requiredCourses = await Course.createQueryBuilder()
      .where(`Course.id IN (:...ids)`, {
        ids: requiredCoursesIds,
      })
      .getMany()

    if (!requiredCourses || requiredCourses.length !== requiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.requiredCourses} не існує.`)
    }

    const notRequiredCourses = await Course.createQueryBuilder()
      .where(`Course.id IN (:...ids)`, {
        ids: requiredCoursesIds,
      })
      .getMany()

    if (!notRequiredCourses || notRequiredCourses.length !== notRequiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.notRequiredCourses} не існує.`)
    }

    const vote = await this.votingRepository.create().save({ data: { id: sub } })

    return plainToClass(CreateCourseResponseDto, vote, {
      excludeExtraneousValues: true,
    })
  }

  async findAll() {
    return await `This action returns all voting`
  }

  async findOne(id: number) {
    return await `This action returns a #${id} voting`
  }

  async update(id: number, updateVotingDto: UpdateVotingDto, tokenDto?: TokenDto) {
    return await `This action updates a #${id} voting`
  }

  async remove(id: number, tokenDto?: TokenDto) {
    return await `This action removes a #${id} voting`
  }
}
