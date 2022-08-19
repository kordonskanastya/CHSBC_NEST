import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
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
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { GetVotingDto } from './dto/get-voting.dto'
import { Student } from '../students/entities/student.entity'

export enum VotingColumns {
  ID = 'id',
  GROUPS = 'groups',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  REQUIRED_COURSES = 'requiredCourses',
  NOT_REQUIRES_COURSES = 'notRequiredCourses',
}

export const VOTING_COLUMN_LIST = enumToArray(VotingColumns)
export const VOTING_COLUMNS = enumToObject(VotingColumns)

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
    const students = await Student.createQueryBuilder()
      .leftJoin('Student.group', 'Group')
      .where(`Group.id IN (:...ids)`, {
        ids: groupIds,
      })
      .getMany()

    const vote = await this.votingRepository
      .create({
        startDate: new Date(createVotingDto.startDate).toISOString(),
        endDate: new Date(createVotingDto.endDate).toISOString(),
        requiredCourses,
        notRequiredCourses,
        groups,
        students,
      })
      .save({ data: { id: sub } })

    return plainToClass(CreateCourseResponseDto, vote, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    id: number,
    orderByColumn: VotingColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    groups: number[],
    startDate: string,
    endDate: string,
    requiredCourses: number[],
    notRequiredCourses: number[],
  ) {
    orderByColumn = orderByColumn || VotingColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(VOTING_COLUMN_LIST, orderByColumn)

    const query = this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .loadRelationCountAndMap('Vote.allStudents', 'Vote.students', 'students')

    if (name) {
      query.andWhere('Vote.name=:name', { name })
    }

    if (startDate) {
      query.andWhere('Vote.startDate=:startDate', { startDate })
    }

    if (endDate) {
      query.andWhere('Vote.endDate=:endDate', { endDate })
    }

    if (groups) {
      if (typeof groups === 'object') {
        query.andWhere('Group.id IN (:...groups)', { groups })
      } else {
        if (typeof groups === 'string') {
          query.andWhere('Group.id=:groupId', { groupId: groups })
        }
      }
    }

    if (requiredCourses) {
      if (typeof requiredCourses === 'object') {
        query.andWhere('Course_required.id IN (:...requiredCourses)', { requiredCourses })
      } else {
        if (typeof requiredCourses === 'string') {
          query.andWhere('Course_required.id=:requiredCourseId', { requiredCourseId: requiredCourses })
        }
      }
    }

    if (notRequiredCourses) {
      if (typeof notRequiredCourses === 'object') {
        query.andWhere('Course_notRequired.id IN (:...notRequiredCourses)', { notRequiredCourses })
      } else {
        if (typeof notRequiredCourses === 'string') {
          query.andWhere('Course_notRequired.id=:notRequiredCourseId', { notRequiredCourseId: notRequiredCourses })
        }
      }
    }
    query.orderBy(`Vote.${orderByColumn}`, orderBy)
    console.log(await query.getMany())
    return await paginateAndPlainToClass(GetVotingDto, query, options)
  }

  async findOne(id: number) {
    const query = this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .loadRelationCountAndMap('Vote.allStudents', 'Vote.students', 'students')
      .where('Vote.id=:id', { id })
      .getOne()

    if (!query) {
      throw new BadRequestException(`Голосування з id: ${id} не знайдено`)
    }

    return plainToClass(GetVotingDto, query, { excludeExtraneousValues: true })
  }

  async update(id: number, updateVotingDto: UpdateVotingDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}
    const vote = await this.votingRepository.findOne(id)

    if (!vote) {
      throw new NotFoundException(`Голосування з id: ${id} не знайдено `)
    }

    const getCourses = async (courses_) => {
      const coursesIds = Array.isArray(courses_) ? courses_ : [courses_]
      const courses = await Course.createQueryBuilder()
        .where(`Course.id IN (:...ids)`, {
          ids: coursesIds,
        })
        .getMany()

      if (!courses || courses.length !== coursesIds.length) {
        throw new BadRequestException(`Предмет з іd: ${courses_} не існує .`)
      }

      return courses
    }
    const getGroups = async (groups_) => {
      const groupsIds = Array.isArray(groups_) ? groups_ : [groups_]
      const groups = await Group.createQueryBuilder()
        .where(`Group.id IN (:...ids)`, {
          ids: groupsIds,
        })
        .getMany()

      if (!groups || groups.length !== groupsIds.length) {
        throw new BadRequestException(`Група з іd: ${groups_} не існує .`)
      }

      const students = await Student.createQueryBuilder()
        .leftJoin('Student.group', 'Group')
        .where(`Group.id IN (:...ids)`, {
          ids: groupsIds,
        })
        .getMany()
      return { groups, students }
    }
    Object.assign(vote, updateVotingDto)

    if (updateVotingDto.groups && updateVotingDto.requiredCourses && updateVotingDto.notRequiredCourses) {
      const { groups, students } = await getGroups(updateVotingDto.groups)
      const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
      const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
      Object.assign(vote, { ...updateVotingDto, groups, requiredCourses, notRequiredCourses, students })
    } else {
      if (updateVotingDto.requiredCourses && updateVotingDto.notRequiredCourses) {
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
        Object.assign(vote, { ...updateVotingDto, requiredCourses, notRequiredCourses })
      }
      if (updateVotingDto.requiredCourses && updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        Object.assign(vote, { ...updateVotingDto, groups, requiredCourses, students })
      }
      if (updateVotingDto.notRequiredCourses && updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
        Object.assign(vote, { ...updateVotingDto, groups, notRequiredCourses, students })
      }
      if (updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        Object.assign(vote, { ...updateVotingDto, groups, students })
      }
      if (updateVotingDto.requiredCourses) {
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        Object.assign(vote, { ...updateVotingDto, requiredCourses })
      }
      if (updateVotingDto.notRequiredCourses) {
        const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
        Object.assign(vote, { ...updateVotingDto, notRequiredCourses })
      }
    }

    try {
      await vote.save({ data: { id: sub } })
      return {
        success: true,
      }
    } catch (e) {
      throw new NotAcceptableException('Не вишло зберегти голосування.' + e.message)
    }
  }

  async remove(id: number, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const vote = await this.votingRepository.findOne(id)
    if (!vote) {
      throw new NotFoundException(`Голосування з id: ${id} не знайдений `)
    }

    await this.votingRepository.remove(vote, {
      data: {
        id: sub,
      },
    })

    return {
      success: true,
    }
  }
}
