import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { CreateVotingDto } from './dto/create-voting.dto'
import { UpdateVotingDto } from './dto/update-voting.dto'
import { TokenDto } from '../../auth/dto/token.dto'
import { VOTE_REPOSITORY } from '../../constants'
import { In, Repository } from 'typeorm'
import { Vote } from './entities/voting.entity'
import { Group } from '../groups/entities/group.entity'
import { Course } from '../courses/entities/course.entity'
import { plainToClass } from 'class-transformer'
import { CreateCourseResponseDto } from '../courses/dto/create-course-response.dto'
import { checkColumnExist, differenceInArray, enumToArray, enumToObject } from '../../utils/common'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { GetVotingDto } from './dto/get-voting.dto'
import { Student } from '../students/entities/student.entity'
import { GetOneVoteDto } from './dto/get-one-vote.dto'
import { GetVotingResultDto } from './dto/get-voting-result.dto'
import { VotingResult } from './entities/voting-result.entity'
import { CreateStudentVoteDto } from './dto/create-student-vote.dto'
import { GetVoteForStudentPageDto } from './dto/get-vote-for-student-page.dto'
import { GetVotingSubmitDto } from './dto/get-voting-submit.dto'
import { Grade } from '../grades/entities/grade.entity'
import { CourseType } from '../courses/courses.service'

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
  NEW = 'Нове',
  IN_PROGRESS = 'У прогресі',
  NEEDS_REVIEW = 'Потребує перегляду',
  NEW_REVOTE = 'Заплановане переголосування',
  REVOTE_IN_PROGRESS = 'Переголосування у прогресі',
  APPROVED = 'Затвердженно',
}

export const VOTING_COLUMN_LIST = enumToArray(VotingColumns)
export const VOTING_COLUMNS = enumToObject(VotingColumns)

@Injectable()
export class VotingService {
  private minQuantityVotesToApproveCourse = 15

  constructor(
    @Inject(VOTE_REPOSITORY)
    private votingRepository: Repository<Vote>,
  ) {}

  async create(createVotingDto: CreateVotingDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const groupIds = Array.isArray(createVotingDto.groups) ? createVotingDto.groups : [createVotingDto.groups]
    const groups = await Group.createQueryBuilder()
      .leftJoinAndSelect('Group.students', 'Student')
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
    if (createVotingDto.requiredCourses.length === 0 && createVotingDto.notRequiredCourses.length === 0) {
      throw new BadRequestException('Не можна створити голосування тому, що немає предметів')
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

    if (!requiredCourses || requiredCourses.length !== requiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.requiredCourses} не існує.`)
    }

    const notRequiredCourses = await Course.createQueryBuilder()
      .where(`Course.id IN (:...ids)`, {
        ids: notRequiredCoursesIds,
      })
      .getMany()

    if (!notRequiredCourses || notRequiredCourses.length !== notRequiredCoursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${createVotingDto.notRequiredCourses} не існує.`)
    }

    const students = []
    groups.map((gr) => gr.students.map((st) => students.push(st)))

    const vote = await this.votingRepository
      .create({
        ...createVotingDto,
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

  async findAllWithPagination(
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
    await this.updateStatusVoting()

    const query = this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .loadRelationCountAndMap('Vote.allStudents', 'Vote.students', 'AllStudents')

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

  async findAllWithoutPagination(
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
    await this.updateStatusVoting()

    const query = this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .loadRelationCountAndMap('Vote.allStudents', 'Vote.students', 'AllStudents')

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
    return plainToClass(GetVotingDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOne(id: number) {
    await this.updateStatusVoting()

    const query = await this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .where('Vote.id=:id', { id })
      .getOne()
    if (!query) {
      throw new BadRequestException(`Голосування з id: ${id} не знайдено`)
    }

    return plainToClass(GetOneVoteDto, query, { excludeExtraneousValues: true })
  }

  async update(id: number, updateVotingDto: UpdateVotingDto, tokenDto?: TokenDto) {
    await this.updateStatusVoting()
    const { sub } = tokenDto || {}
    const vote = await this.votingRepository.findOne(id, { relations: ['groups'] })
    const votingGroupsId = vote.groups.map((group) => group.id)

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

    if (updateVotingDto.groups && updateVotingDto.requiredCourses && updateVotingDto.notRequiredCourses) {
      const { groups, students } = await getGroups(updateVotingDto.groups)
      const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
      const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
      Object.assign(vote, { ...updateVotingDto, groups, requiredCourses, notRequiredCourses, students })

      const deletedGroupsIdArray = differenceInArray(votingGroupsId, updateVotingDto.groups)
      deletedGroupsIdArray.map(async (groupId) => {
        const students = await Student.find({ where: { group: { id: groupId } } })
        students.map(async (student) => {
          await VotingResult.delete({ student })
        })
      })
    } else {
      if (updateVotingDto.requiredCourses && updateVotingDto.notRequiredCourses) {
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
        Object.assign(vote, { ...updateVotingDto, requiredCourses, notRequiredCourses })
      } else if (updateVotingDto.requiredCourses && updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        Object.assign(vote, { ...updateVotingDto, groups, requiredCourses, students })
      } else if (updateVotingDto.notRequiredCourses && updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        const notRequiredCourses = await getCourses(updateVotingDto.notRequiredCourses)
        Object.assign(vote, { ...updateVotingDto, groups, notRequiredCourses, students })
      } else if (updateVotingDto.groups) {
        const { groups, students } = await getGroups(updateVotingDto.groups)
        Object.assign(vote, { ...updateVotingDto, groups, students })
      } else if (updateVotingDto.requiredCourses) {
        const requiredCourses = await getCourses(updateVotingDto.requiredCourses)
        Object.assign(vote, { ...updateVotingDto, requiredCourses })
      } else if (updateVotingDto.notRequiredCourses) {
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
    try {
      await this.votingRepository
        .createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.NEW })
        .where(`"startDate"::timestamp>now()`)
        .andWhere('isRevote=false')
        .execute()
      await this.votingRepository
        .createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.IN_PROGRESS })
        .where(`now() between "startDate"::timestamp and "endDate"::timestamp`)
        .andWhere('isRevote=false')
        .execute()
      await this.votingRepository
        .createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.NEEDS_REVIEW })
        .where(`"endDate"::timestamp<now()`)
        .andWhere('isRevote=false')
        .execute()
      await Vote.createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.REVOTE_IN_PROGRESS })
        .andWhere('isRevote=true')
        .andWhere(`now() between "startDate"::timestamp and "endDate"::timestamp`)
        .execute()
      await Vote.createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.NEEDS_REVIEW })
        .andWhere('isRevote=true')
        .andWhere(`"endDate"::timestamp<now()`)
        .execute()
      await Vote.createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.NEW_REVOTE })
        .where(`"startDate"::timestamp>now()`)
        .andWhere('isRevote=true')
        .execute()
      await Vote.createQueryBuilder()
        .update(Vote)
        .set({ status: VotingStatus.APPROVED })
        .where('isApproved=true')
        .execute()
      await this.updateTookPart()
    } catch (e) {
      throw new BadRequestException('Не вишло оновити статус: ' + e.message)
    }
  }

  async findOneVotingResult(id: number) {
    await this.updateStatusVoting()
    const votes = await this.votingRepository
      .createQueryBuilder('Vote')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Group.students', 'Student')
      .leftJoinAndSelect('Student.group', 'Student_group')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .where('Vote.id=:id', { id })
      .getOne()

    if (!votes) {
      throw new BadRequestException(`Голосування з id: ${id} не знайдено`)
    }

    const studentsInGroup = []
    votes.groups.map((group) => group.students.map((student) => studentsInGroup.push(student)))

    const votingResults = await VotingResult.createQueryBuilder('votingResult')
      .leftJoinAndSelect('votingResult.student', 'Student')
      .where('votingResult.vote=:id', { id })
      .leftJoinAndSelect('votingResult.course', 'Course')
      .getMany()

    const coursesids = [
      ...votes.requiredCourses.map((course) => course.id),
      ...votes.notRequiredCourses.map((course) => course.id),
    ]

    if (coursesids.length === 0) {
      throw new BadRequestException('Не можна відобразити результат тому, що у голосуванні немає предметів')
    }

    const courses = await Course.createQueryBuilder()
      .leftJoinAndSelect('Course.teacher', 'Teacher')
      .leftJoin('Course.votingResults', 'VoteResult')
      .leftJoin('VoteResult.vote', 'VoteResult_vote')
      .loadRelationCountAndMap('Course.allVotes', 'Course.votingResults', 'Vt', (qb) =>
        qb.where('Vt.voteId=:id', { id }),
      )
      .andWhere(`Course.id IN (:...ids)`, { ids: coursesids })
      .getMany()

    const studentsInRes = []
    votingResults.map((result) => studentsInRes.push(result.student))

    const students = []
    studentsInGroup.map((studentInGroup) => {
      {
        let isVoted = false
        studentsInRes.map((studentInRes) => {
          if (studentInGroup.id === studentInRes.id) {
            isVoted = true
          }
        })
        students.push({ ...studentInGroup, isVoted: isVoted })
      }
    })

    return plainToClass(
      GetVotingResultDto,
      {
        ...votes,
        students,
        courses,
      },
      { excludeExtraneousValues: true },
    )
  }

  async getVotingForStudent(token: TokenDto) {
    await this.updateStatusVoting()
    const { sub } = token
    const student = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.vote', 'Vote')
      .leftJoinAndSelect('Student.group', 'Group')
      .where('User.id=:id', { id: sub })
      .getOne()

    if (!student) {
      throw new NotFoundException(`Студент не знайдений`)
    }

    const vote = await this.votingRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Vote.groups', 'Group')
      .leftJoinAndSelect('Vote.requiredCourses', 'Course_required')
      .leftJoinAndSelect('Course_required.teacher', 'Teacher')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'Course_notRequired')
      .leftJoinAndSelect('Course_notRequired.teacher', 'Teacher_')
      .where('Group.id=:groupId', { groupId: student.group.id })
      .andWhere('(Vote.status=:statusInProgress OR Vote.status=:statusRevote )', {
        statusInProgress: VotingStatus.IN_PROGRESS,
        statusRevote: VotingStatus.REVOTE_IN_PROGRESS,
      })
      .getOne()
    if (vote) {
      const coursesApprovedIdSelect = await VotingResult.createQueryBuilder('vr')
        .leftJoinAndSelect('vr.course', 'Course')
        .select('Course.id as id')
        .groupBy('Course.id')
        .andWhere('vr."voteId"=:id', { id: vote.id })
        .having('count(vr."courseId")>=:minQuantityVotesToApproveCourse', {
          minQuantityVotesToApproveCourse: this.minQuantityVotesToApproveCourse,
        })
        .getRawMany()
      const voteResults = await VotingResult.find({ where: { student, vote }, relations: ['course'] })
      const studentVotes = new Map()
      voteResults.map((voteResult) => {
        studentVotes.set(voteResult.tableIndex, voteResult.course.id)
      })
      return plainToClass(
        GetVoteForStudentPageDto,
        {
          ...vote,
          approveCourse: coursesApprovedIdSelect.map((course) => course.id),
          studentVotes: Array.from(studentVotes, (value) => value),
        },
        { excludeExtraneousValues: true },
      )
    } else {
      return []
    }
  }

  async postVotingForStudent(voteStudentDto: CreateStudentVoteDto, tokenDto: TokenDto) {
    await this.updateStatusVoting()
    const { sub } = tokenDto || {}
    const student = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.vote', 'Vote')
      .leftJoinAndSelect('Student.group', 'Group')
      .where('User.id=:id', { id: sub })
      .getOne()

    if (!student) {
      throw new BadRequestException(`Студент не знайдений`)
    }

    const coursesIds = Array.isArray(voteStudentDto.courses) ? voteStudentDto.courses : [voteStudentDto.courses]
    const courses = await Course.findByIds(coursesIds)

    if (!courses || courses.length !== coursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${voteStudentDto.courses} не існує.`)
    }

    const vote = await this.votingRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Vote.groups', 'Group')
      .where('Group.id=:studentGroup', { studentGroup: student.group.id })
      .getOne()

    await this.checkVotingStatus(vote)

    vote.groups.map((group) => {
      if (student.group.id !== group.id) {
        throw new BadRequestException(`Ви не можете брати участь у голосуванні`)
      }
    })

    const votingResultsStudents = await VotingResult.createQueryBuilder('vr')
      .leftJoinAndSelect('vr.student', 'Student')
      .leftJoinAndSelect('vr.vote', 'Vote')
      .where('Student.id=:id', { id: student.id })
      .andWhere('Vote.id=:voteId', { voteId: vote.id })
      .getMany()

    if (votingResultsStudents.length > 0) {
      throw new BadRequestException('Ви вже проголосували')
    }

    const sortArray = (courses: Course[], originalArray: number[]) => {
      const sortedArray = []
      originalArray.map((id) => {
        sortedArray.push(courses[courses.findIndex((element) => element.id === id)])
      })
      return sortedArray
    }

    sortArray(courses, voteStudentDto.courses).map(async (course, index) => {
      try {
        await VotingResult.create({
          student,
          course,
          vote,
          tableIndex: index,
        }).save({ data: { id: sub } })
      } catch (e) {
        throw new NotAcceptableException('Не вишло зберегти голосування.' + e.message)
      }
    })
    return { message: 'Ваш голос надісланий та збережений' }
  }

  async updateVotingForStudent(voteStudentDto: CreateStudentVoteDto, tokenDto: TokenDto) {
    await this.updateStatusVoting()
    const { sub } = tokenDto || {}
    const student = await Student.findOne({
      relations: ['group'],
      where: {
        user: sub,
      },
    })
    const coursesIds = Array.isArray(voteStudentDto.courses) ? voteStudentDto.courses : [voteStudentDto.courses]
    const courses = await Course.findByIds(coursesIds)

    if (!courses || courses.length !== coursesIds.length) {
      throw new BadRequestException(`Предмет з іd: ${voteStudentDto.courses} не існує.`)
    }

    const group = await Group.findOne({
      join: { alias: 'Group', leftJoinAndSelect: { vote: 'Group.vote' } },
      where: {
        id: student.group.id,
      },
    })
    this.checkVotingStatus(group.vote)

    try {
      await VotingResult.delete({ vote: group.vote, student })
      await this.postVotingForStudent(voteStudentDto, tokenDto)
      return {
        success: true,
      }
    } catch (e) {
      throw new BadRequestException('Не вишло обновити голосування ' + e.message)
    }
  }

  async getVotingReviewForStudent(tokenDto: TokenDto) {
    await this.updateStatusVoting()
    const { sub } = tokenDto || {}
    const student = await Student.findOne({
      relations: ['group'],
      where: {
        user: sub,
      },
    })

    const votingResultsStudent = await VotingResult.find({
      relations: ['student', 'course'],
      where: {
        student,
      },
    })

    const selectedItems = []
    votingResultsStudent.map((votingResultStudent) => {
      selectedItems.push(votingResultStudent.course)
    })
    return selectedItems
  }

  async getVotingPeriodForStudent(token: TokenDto) {
    const { sub } = token
    const onlyStudent = await Student.createQueryBuilder()
      .leftJoin('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.votingResults', 'VoteResult')
      .where('User.id=:id', { id: sub })
      .getOne()

    if (!onlyStudent) {
      throw new NotFoundException(`Студент не знайдений`)
    }

    const studentWithData = await Student.createQueryBuilder()
      .leftJoin('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .leftJoinAndSelect('Student.votingResults', 'VoteResult')
      .leftJoinAndSelect('VoteResult.vote', 'Vote')
      .where('User.id=:id', { id: sub })
      .getOne()

    const vote = await this.votingRepository
      .createQueryBuilder()
      .leftJoin('Vote.groups', 'Group')
      .where('Group.id=:groupId', { groupId: studentWithData.group.id })
      .getOne()

    const isVoted = studentWithData.votingResults.filter((voteResult) => voteResult.vote.id === vote.id)
    if (vote) {
      if (isVoted.length > 0) {
        return {
          startDate: vote?.startDate,
          endDate: vote?.endDate,
          isRevote: vote?.isRevote,
          isVoted: true,
        }
      } else {
        return {
          startDate: vote?.startDate,
          endDate: vote?.endDate,
          isRevote: vote?.isRevote,
          isVoted: false,
        }
      }
    }
  }

  async updateTookPart() {
    const voteRes = await VotingResult.createQueryBuilder('vr')
      .select('distinct vr.voteId')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(distinct student.id)', 'count')
          .from('students', 'student')
          .leftJoin('student.votingResults', 'res')
          .where('res.studentId=student.id')
      }, 'count')
      .getRawMany()

    voteRes.map(async (result) => {
      await Vote.createQueryBuilder()
        .update(Vote)
        .set({ tookPart: Number(result.count) })
        .where('id=:id', { id: result.voteId })
        .execute()
    })

    if (voteRes.length === 0) {
      await Vote.createQueryBuilder().update(Vote).set({ tookPart: 0 }).execute()
    }
  }

  checkVotingStatus(vote: Vote) {
    if (vote.status === VotingStatus.NEEDS_REVIEW || vote.status === VotingStatus.APPROVED) {
      throw new BadRequestException(`Голосування вже закінчено`)
    }

    if (vote.status === VotingStatus.NEW) {
      throw new BadRequestException(`Голосування ще не почалося`)
    }
  }

  async submitCourseByVoteId(course_ids: number[], tokenDto: TokenDto, voteId: number) {
    await this.updateStatusVoting()
    const { sub } = tokenDto
    const resultsForCourses = await VotingResult.find({
      relations: ['course', 'vote'],
      join: {
        alias: 'VotingResult',
        leftJoinAndSelect: {
          Student: 'VotingResult.student',
          Course: 'Student.courses',
        },
      },
      where: {
        course: In(course_ids),
        vote: {
          status: VotingStatus.NEEDS_REVIEW,
          id: voteId,
        },
      },
    })

    if (!resultsForCourses) {
      throw new BadRequestException(`Результатів для предметів з id: ${course_ids}  не знайдено`)
    }

    function groupBy(list, keyGetter) {
      const map = new Map()
      list.forEach((item) => {
        const key = keyGetter(item)
        const collection = map.get(key)
        if (!collection) {
          map.set(key, [item.course])
        } else {
          collection.push(item.course)
        }
      })
      return Array.from(map, ([name, value]) => ({ name, value }))
    }

    const studentVotedCourses = groupBy(resultsForCourses, (res) => res.student.id)
    try {
      studentVotedCourses.map(async (studVoteResult) => {
        const student = await Student.findOne(studVoteResult.name, { relations: ['courses'] })
        const studentRequiredCourses = student.courses.filter(
          (course) =>
            course.type === CourseType.GENERAL_COMPETENCE || course.type === CourseType.PROFESSIONAL_COMPETENCE,
        )
        const newCourses = [...studentRequiredCourses, ...studVoteResult.value]
        Object.assign(student, { ...student, courses: newCourses })
        try {
          await student.save({ data: { id: sub } })
        } catch (e) {
          throw new NotAcceptableException('Не вишло затвердити предмет.' + e.message)
        }
      })

      resultsForCourses.map(async (resultForOneCourse) => {
        try {
          await Grade.create({
            course: resultForOneCourse.course,
            student: resultForOneCourse.student,
            grade: 0,
          }).save({ data: { id: sub } })
        } catch (e) {
          throw new NotAcceptableException('Не вишло затвердити предмет.' + e.message)
        }
      })

      await this.votingRepository
        .createQueryBuilder()
        .update(Vote)
        .set({
          status: VotingStatus.APPROVED,
          isApproved: true,
        })
        .where('id=:voteId', { voteId })
        .execute()
    } catch (e) {
      throw new NotAcceptableException('Не вишло затвердити предмет.' + e.message)
    }
    return {
      success: true,
    }
  }

  async getSubmitCoursesForm(id: number) {
    const vote = await Vote.createQueryBuilder()
      .leftJoinAndSelect('Vote.requiredCourses', 'RequiredCourses')
      .leftJoinAndSelect('Vote.notRequiredCourses', 'NotRequiredCourses')
      .leftJoinAndSelect('RequiredCourses.teacher', 'RequiredCoursesTeacher')
      .leftJoinAndSelect('NotRequiredCourses.teacher', 'NotRequiredCoursesTeacher')
      .leftJoinAndSelect('Vote.groups', 'Group')
      .loadRelationCountAndMap('NotRequiredCourses.allVotes', 'RequiredCourses.votingResults', 'Vt', (qb) =>
        qb.where('Vt.voteId=:id', { id }),
      )
      .loadRelationCountAndMap('RequiredCourses.allVotes', 'NotRequiredCourses.votingResults', 'Vt', (qb) =>
        qb.where('Vt.voteId=:id', { id }),
      )
      .where('Vote.id=:id', { id })
      .getOne()

    if (!vote) {
      throw new BadRequestException(`Предмети для голосування з id:${id} не знайдено`)
    }

    return plainToClass(GetVotingSubmitDto, vote, { excludeExtraneousValues: true })
  }
}
