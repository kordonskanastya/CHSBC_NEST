import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { Repository } from 'typeorm'
import { TokenDto } from '../../auth/dto/token.dto'
import { COURSE_REPOSITORY } from '../../constants'
import { Group } from '../groups/entities/group.entity'
import { CreateCourseResponseDto } from './dto/create-course-response.dto'
import { UsersService } from '../users/users.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { GetCourseResponseDto } from './dto/get-course-response.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { Course } from './entities/course.entity'
import { GetCourseDropdownResponseDto } from './dto/get-course-dropdown-response.dto'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'

export enum CourseColumns {
  ID = 'id',
  NAME = 'name',
  CREDITS = 'credits',
  LECTURE_HOURS = 'lectureHours',
  IS_ACTIVE = 'isActive',
  SEMESTER = 'semester',
  IS_COMPULSORY = 'isCompulsory',
  TEACHER = 'teacher',
  GROUPS = 'groups',
}

export const COURSE_COLUMN_LIST = enumToArray(CourseColumns)
export const COURSE_COLUMNS = enumToObject(CourseColumns)

@Injectable()
export class CoursesService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private coursesRepository: Repository<Course>,
    private usersService: UsersService,
  ) {}
  async create(createCourseDto: CreateCourseDto, tokenDto?: TokenDto): Promise<CreateCourseResponseDto> {
    const { sub, role } = tokenDto || {}

    if (
      await this.coursesRepository
        .createQueryBuilder()
        .where(`LOWER(name) = LOWER(:name)`, { name: createCourseDto.name })
        .getOne()
    ) {
      throw new BadRequestException(`This course name: ${createCourseDto.name} already exist.`)
    }

    const groupIds = Array.isArray(createCourseDto.groups) ? createCourseDto.groups : [createCourseDto.groups]
    const groups = await Group.createQueryBuilder()
      .where(`Group.id IN (:...ids)`, {
        ids: groupIds,
      })
      .getMany()
    if (!groups || groups.length !== groupIds.length) {
      throw new BadRequestException(`This group with Id: ${createCourseDto.groups} doesn't exist.`)
    }

    const teacher = await this.usersService.findOne(createCourseDto.teacher)
    if (!teacher) {
      throw new BadRequestException(`This teacher with Id: ${createCourseDto.teacher} doesn't exist.`)
    }

    const course = await this.coursesRepository.create({ ...createCourseDto, teacher, groups }).save()

    if (!course) {
      throw new BadRequestException(`Can't create course, some unexpected error`)
    }

    return plainToClass(CreateCourseResponseDto, course, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    orderByColumn: CourseColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    credits: number,
    lectureHours: number,
    isActive: boolean,
    semester: number,
    isCompulsory: boolean,
    teacher: number,
    groups: number[],
  ) {
    orderByColumn = orderByColumn || CourseColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(COURSE_COLUMN_LIST, orderByColumn)

    const query = this.coursesRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Course.groups', 'Group')
      .leftJoinAndSelect('Course.teacher', 'User')

    if (search) {
      query.andWhere(
        `concat_ws(' ', LOWER(Course.name), LOWER(Course.credits), 
        LOWER(Course.lectureHours), LOWER(Course.isActive), LOWER(Course.semester),
        LOWER(Course.isCompulsory), LOWER(Course.teacher), LOWER(Course.groups)) 
        LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (name) {
      query.andWhere(`LOWER(Course.name) LIKE LOWER('%${name}%')`)
    }

    if (credits) {
      query.andWhere({ credits })
    }

    if (lectureHours) {
      query.andWhere({ lectureHours })
    }

    if (isActive) {
      query.andWhere({ isActive })
    }

    if (semester) {
      query.andWhere({ semester })
    }

    if (isCompulsory) {
      query.andWhere({ isCompulsory })
    }

    if (teacher) {
      query.andWhere({ teacher })
    }

    if (groups) {
      query.andWhere({ groups })
    }

    query.orderBy(`Course.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetCourseResponseDto, query, options)
  }

  async findOne(id: number): Promise<GetCourseResponseDto> {
    const course = await this.coursesRepository
      .createQueryBuilder()
      .where({ id })
      .leftJoinAndSelect('Course.teacher', 'User')
      .leftJoinAndSelect('Course.groups', 'Group')
      .getOne()

    if (!course) {
      throw new NotFoundException(`Not found course id: ${id}`)
    }

    return plainToClass(GetCourseResponseDto, course, { excludeExtraneousValues: true })
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, tokenDto?: TokenDto) {
    const { sub, role } = tokenDto || {}

    if (
      await this.coursesRepository
        .createQueryBuilder()
        .where(`LOWER(name) = LOWER(:name)`, { name: updateCourseDto.name })
        .getOne()
    ) {
      throw new BadRequestException(`This course name: ${updateCourseDto.name} already exist.`)
    }

    const course = await this.coursesRepository.findOne(id)
    if (!course) {
      throw new NotFoundException(`Not found course id: ${id}`)
    }

    Object.assign(course, updateCourseDto)

    if (updateCourseDto.groups) {
      const groupIds = Array.isArray(updateCourseDto.groups) ? updateCourseDto.groups : [updateCourseDto.groups]
      const groups = await Group.createQueryBuilder()
        .where(`Group.id IN (:...ids)`, {
          ids: groupIds,
        })
        .getMany()

      if (!groups || groups.length !== groupIds.length) {
        throw new BadRequestException(`This group with Id: ${updateCourseDto.groups} doesn't exist.`)
      }
      Object.assign(course, { ...updateCourseDto, groups })
    }

    if (updateCourseDto.teacher) {
      const teacher = await this.usersService.findOne(updateCourseDto.teacher)
      if (!teacher) {
        throw new BadRequestException(`This teacher with Id: ${updateCourseDto.teacher} doesn't exist.`)
      }
      Object.assign(course, { ...updateCourseDto, teacher })
    }

    try {
      await course.save({ data: { id: sub } })
    } catch (e) {
      throw new NotAcceptableException("Can't save group. " + e.message)
    }

    return {
      success: true,
    }
  }

  async remove(id: number, tokenDto?: TokenDto) {
    const { sub, role } = tokenDto || {}

    const course = await this.coursesRepository.findOne(id)
    if (!course) {
      throw new NotFoundException(`Not found course id: ${id}`)
    }

    await this.coursesRepository.remove(course, {
      data: {
        id: sub,
      },
    })

    return {
      success: true,
    }
  }

  async getCoursesDropdown(): Promise<GetCourseDropdownResponseDto[]> {
    const courses = await this.coursesRepository.createQueryBuilder().getMany()
    return plainToClass(GetCourseDropdownResponseDto, courses, { excludeExtraneousValues: true })
  }
}
