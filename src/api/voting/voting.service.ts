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
import { GetOneVoteDto } from './dto/get-one-vote.dto'
import { GetVotingResultDto } from './dto/getVotingResult.dto'

export enum VotingColumns {
  ID = 'id',
  GROUPS = 'groups',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  REQUIRED_COURSES = 'requiredCourses',
  NOT_REQUIRES_COURSES = 'notRequiredCourses',
  CREATED = 'created',
  UPDATED = 'updated',
}

export enum VotingStatus {
  NEW = 'Нове голосування',
  IN_PROGRESS = 'У прогресі',
  ENDED = 'Закінчене голосування',
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

    const votingGroups = await this.votingRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Vote.groups', 'Group')
      .where(`Group.id IN (:...ids)`, {
        ids: groupIds,
      })
      .getMany()

    if (votingGroups.length > 0) {
      throw new BadRequestException(
        `Голосування із такими групами ${votingGroups.map((vote) => vote.groups.map((group) => group.name))} вже існує`,
      )
    }

    if (createVotingDto.startDate > createVotingDto.endDate) {
      throw new BadRequestException('Дата старту голосування не може бути пізніше,чим кінець голосування')
    }

    if (new Date() > createVotingDto.startDate) {
      throw new BadRequestException(
        `Дата старту голосування не може бути раніше,чим ${new Date().toLocaleDateString()}`,
      )
    }

    const requiredCoursesIds = Array.isArray(createVotingDto.requiredCourses)
      ? createVotingDto.requiredCourses
      : [createVotingDto.requiredCourses]
    const notRequiredCoursesIds = Array.isArray(createVotingDto.notRequiredCourses)
      ? createVotingDto.notRequiredCourses
      : [createVotingDto.notRequiredCourses]

    if (requiredCoursesIds.length === 0 || notRequiredCoursesIds.length === 0) {
      throw new BadRequestException(
        `Предмет  з іd: ${
          requiredCoursesIds.length === 0 ? createVotingDto.requiredCourses : createVotingDto.notRequiredCourses
        } не існує. `,
      )
    }

    const requiredCourses = await Course.createQueryBuilder()
      .where(`Course.id IN (:...ids)`, {
        ids: requiredCoursesIds,
      })
      .getMany()

    // const checkRequired = (courses: Course[], isRequired: boolean) => {
    //   courses.map((course) => {
    //     if (course.isCompulsory !== isRequired) {
    //       throw new BadRequestException(`Предмет ${course.name} ,не ${isRequired ? "обов'язковий" : 'вибірковий'}`)
    //     }
    //   })
    // }

    if (!requiredCourses || requiredCourses.length !== requiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.requiredCourses} не існує.`)
    }

    //checkRequired(requiredCourses, true)

    const notRequiredCourses = await Course.createQueryBuilder()
      .where(`Course.id IN (:...ids)`, {
        ids: notRequiredCoursesIds,
      })
      .getMany()

    if (!notRequiredCourses || notRequiredCourses.length !== notRequiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.notRequiredCourses} не існує.`)
    }

    //checkRequired(notRequiredCourses, false)

    const vote = await this.votingRepository
      .create({
        ...createVotingDto,
        requiredCourses,
        notRequiredCourses,
        groups,
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
    status: VotingStatus,
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

    await this.updateStatusVoting()

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

    if (status) {
      query.andWhere('Vote.status=:status', { status })
    }

    query.orderBy(`Vote.${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetVotingDto, query, options)
  }

  async findOne(id: number) {
    await this.updateStatusVoting()
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

    return plainToClass(GetOneVoteDto, query, { excludeExtraneousValues: true })
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

  async updateStatusVoting() {
    await this.votingRepository
      .createQueryBuilder()
      .update(Vote)
      .set({ status: VotingStatus.NEW })
      .where(`"startDate"::timestamp>now()`)
      .execute()
    await this.votingRepository
      .createQueryBuilder()
      .update(Vote)
      .set({ status: VotingStatus.IN_PROGRESS })
      .where(`now() between "startDate"::timestamp and "endDate"::timestamp`)
      .execute()
    await this.votingRepository
      .createQueryBuilder()
      .update(Vote)
      .set({ status: VotingStatus.ENDED })
      .where(`"endDate"::timestamp<now()`)
      .execute()
  }

  async findOneVotingResult(id: number) {
    await this.updateStatusVoting()
    const votingResult = await this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Course_required.teacher', 'requiredTeacher')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .leftJoinAndSelect('Course_notRequired.teacher', 'notRequiredTeacher')
      .leftJoinAndSelect('Group.students', 'Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.votes', 'S')
      .where('Vote.id=:id', { id })
      .getOne()

    if (!votingResult) {
      throw new BadRequestException(`Голосування з id: ${id} не знайдено`)
    }
    // TODO проголосовал студик или нет
    const students = []
    votingResult.groups.map((group) => group.students.map((student) => students.push(student)))
    return plainToClass(
      GetVotingResultDto,
      {
        ...votingResult,
        courses: [...votingResult.requiredCourses, ...votingResult.notRequiredCourses],
        students,
      },
      { excludeExtraneousValues: true },
    )
  }
}
