import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { In, Repository } from 'typeorm'
import { TokenDto } from '../../auth/dto/token.dto'
import { COURSE_REPOSITORY, GRADE_REPOSITORY } from '../../constants'
import { Group } from '../groups/entities/group.entity'
import { CreateCourseResponseDto } from './dto/create-course-response.dto'
import { CreateCourseDto } from './dto/create-course.dto'
import { GetCourseResponseDto } from './dto/get-course-response.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { Course } from './entities/course.entity'
import { GetCourseDropdownResponseDto } from './dto/get-course-dropdown-response.dto'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { ROLE } from '../../auth/roles/role.enum'
import { User } from '../users/entities/user.entity'
import { Grade } from '../grades/entities/grade.entity'
import { Student } from '../students/entities/student.entity'

export enum CourseColumns {
  ID = 'id',
  NAME = 'name',
  CREDITS = 'credits',
  LECTURE_HOURS = 'lectureHours',
  IS_ACTIVE = 'isActive',
  SEMESTER = 'semester',
  TYPE = 'type',
  TEACHER = 'teacher',
  GROUPS = 'groups',
  CREATED = 'created',
  UPDATED = 'updated',
}

export enum SEMESTER {
  FIRST = 1,
  SECOND = 2,
}

export enum CourseType {
  GENERAL_COMPETENCE = 'Загальна компетентність',
  PROFESSIONAL_COMPETENCE = 'Фахова компетентність',
  SELECTIVE_GENERAL_COMPETENCE = 'Вибіркова загальна компетентність',
  SELECTIVE_PROFESSIONAL_COMPETENCE = 'Вибіркова фахова компетентність',
}

export const COURSE_COLUMN_LIST = enumToArray(CourseColumns)
export const COURSE_COLUMNS = enumToObject(CourseColumns)

@Injectable()
export class CoursesService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private coursesRepository: Repository<Course>,
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createCourseDto: CreateCourseDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    if (
      await this.coursesRepository
        .createQueryBuilder()
        .where(`LOWER(name) = LOWER(:name)`, { name: createCourseDto.name })
        .getOne()
    ) {
      throw new BadRequestException(`Предмет з таким ім'ям: ${createCourseDto.name} вже існує`)
    }

    const groupIds = Array.isArray(createCourseDto.groups) ? createCourseDto.groups : [createCourseDto.groups]
    const groups = await Group.createQueryBuilder()
      .where(`Group.id IN (:...ids)`, {
        ids: groupIds,
      })
      .getMany()

    if (!groups || groups.length !== groupIds.length) {
      throw new BadRequestException(`Група з іd: ${createCourseDto.groups} не існує.`)
    }

    const teacher = await User.findOne(createCourseDto.teacher)

    if (!teacher) {
      throw new BadRequestException(`Вчитель з іd: ${createCourseDto.teacher} не існує.`)
    }

    if (teacher.role !== ROLE.TEACHER) {
      throw new BadRequestException(`Користувач має роль: ${teacher.role} не teacher`)
    }

    const course = await this.coursesRepository
      .create({ ...createCourseDto, teacher, groups })
      .save({ data: { id: sub } })

    if (!course) {
      throw new BadRequestException(`Не вишло створити предмет`)
    } else {
      const studentsInGroup = await Student.createQueryBuilder()
        .leftJoinAndSelect('Student.courses', 'Course')
        .leftJoinAndSelect('Student.group', 'Group')
        .where(`Group.id IN (:...ids)`, {
          ids: groupIds,
        })
        .getMany()
      studentsInGroup.map(async (student) => {
        if (course.type == CourseType.GENERAL_COMPETENCE || course.type === CourseType.PROFESSIONAL_COMPETENCE) {
          student.courses.push(course)
          Object.assign(student, { ...student, courses: student.courses })
          await student.save({ data: { id: sub } })
          await this.gradeRepository.create({ grade: 0, student, course }).save({ data: { id: sub } })
        }
      })
    }
    return plainToClass(CreateCourseResponseDto, course, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(
    options: IPaginationOptions,
    search: string,
    id: number,
    orderByColumn: CourseColumns,
    orderBy: 'ASC' | 'DESC',
    name: string,
    credits: number,
    lectureHours: number,
    isExam: boolean,
    isActive: boolean,
    semester: number,
    type: string,
    teacher: number,
    groups: number[],
  ) {
    orderByColumn = orderByColumn || CourseColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(COURSE_COLUMN_LIST, orderByColumn)

    const query = this.coursesRepository
      .createQueryBuilder('Course')
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

    if (id) {
      query.andWhere(`Course.id=:id`, { id })
    }

    if (name) {
      query.andWhere(`LOWER(Course.name) LIKE LOWER(:name)`, { name: `%${name}%` })
    }

    if (credits) {
      query.andWhere('Course.credits=:credits', { credits })
    }

    if (lectureHours) {
      query.andWhere('Course.lectureHours=:lectureHours', { lectureHours })
    }

    if (isActive) {
      query.andWhere('Course.isActive=:isActive', { isActive })
    }

    if (isExam) {
      query.andWhere('Course.isExam=:isExam', { isExam })
    }

    if (semester) {
      query.andWhere('Course.semester=:semester', { semester })
    }

    if (type) {
      query.andWhere('Course.type=:type', { type })
    }

    if (teacher) {
      query.andWhere('Course.teacherId=:teacher', { teacher })
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
      throw new NotFoundException(`Предмет з id: ${id} не існує`)
    }

    return plainToClass(GetCourseResponseDto, course, { excludeExtraneousValues: true })
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const course = await this.coursesRepository.findOne({ relations: ['groups'], where: { id: id } })

    if (!course) {
      throw new NotFoundException(`Предмет з id: ${id} не знайдений `)
    }
    Object.assign(course, updateCourseDto)
    if (updateCourseDto.groups && updateCourseDto.teacher) {
      const groupIds = Array.isArray(updateCourseDto.groups) ? updateCourseDto.groups : [updateCourseDto.groups]
      const groups = await Group.createQueryBuilder()
        .where(`Group.id IN (:...ids)`, {
          ids: groupIds,
        })
        .getMany()

      if (!groups || groups.length !== groupIds.length) {
        throw new BadRequestException(`Група з іd: ${updateCourseDto.groups} не існує .`)
      }

      const teacher = await User.findOne(updateCourseDto.teacher)

      if (!teacher) {
        throw new BadRequestException(`Вчитель з іd: ${updateCourseDto.teacher} не існує.`)
      }

      if (teacher.role !== ROLE.TEACHER) {
        throw new BadRequestException(`Користувач має роль : ${teacher.role},не teacher`)
      }

      Object.assign(course, { ...updateCourseDto, teacher, groups })
    } else {
      if (updateCourseDto.groups) {
        const groupIds = Array.isArray(updateCourseDto.groups) ? updateCourseDto.groups : [updateCourseDto.groups]
        const groups = await Group.createQueryBuilder()
          .where(`Group.id IN (:...ids)`, {
            ids: groupIds,
          })
          .getMany()

        if (!groups || groups.length !== groupIds.length) {
          throw new BadRequestException(`Група з іd: ${updateCourseDto.groups} не існує .`)
        }

        Object.assign(course, { ...updateCourseDto, groups })
      } else {
        if (updateCourseDto.teacher) {
          const teacher = await User.findOne(updateCourseDto.teacher)

          if (!teacher) {
            throw new BadRequestException(`Вчитель з іd: ${updateCourseDto.teacher} не існує.`)
          }

          if (teacher.role !== ROLE.TEACHER) {
            throw new BadRequestException(`Користувач має роль : ${teacher.role},не teacher`)
          }

          Object.assign(course, { ...updateCourseDto, teacher })
        }
      }
    }

    if (updateCourseDto.groups) {
      let deletedGroupIdArray = []
      const hash = Object.create(null)
      const courseOld = await Course.findOne(id, { relations: ['groups'] })

      if (courseOld.groups) {
        courseOld.groups.forEach(function (group) {
          hash[group.id] = { value: group.id }
        })
        // insertedArray = updateCourseDto.groups.filter(function (a) {
        //   const r = !hash[a]
        //   if (hash[a]) {
        //     delete hash[a]
        //   }
        //   return r
        // })
        deletedGroupIdArray = Object.keys(hash).map(function (k) {
          return hash[k].value
        })
        const students = []
        await Group.findByIds(updateCourseDto.groups, {
          join: {
            alias: 'Group',
            leftJoinAndSelect: {
              Student: 'Group.students',
              Course: 'Student.courses',
            },
          },
        }).then((groups) => groups.map((group) => group.students.map((student) => students.push(student))))
        students.map(async (student) => {
          if (course.type === CourseType.PROFESSIONAL_COMPETENCE || course.type === CourseType.GENERAL_COMPETENCE) {
            student.courses.push(course)
            await this.gradeRepository.create({ grade: 0, student, course }).save({
              data: { id: sub },
            })
          }
        })
        if (deletedGroupIdArray.length > 0) {
          await Student.find({
            where: {
              group: {
                id: In(deletedGroupIdArray),
              },
            },
          }).then((students) =>
            students.map(async (student) => {
              await Grade.delete({ student })
            }),
          )
        }
      }
    }

    try {
      await course.save({ data: { id: sub } })
    } catch (e) {
      throw new NotAcceptableException('Не вишло зберегти предмет.' + e.message)
    }

    return {
      success: true,
    }
  }

  async remove(id: number, tokenDto?: TokenDto) {
    const { sub } = tokenDto || {}

    const course = await this.coursesRepository.findOne(id)
    if (!course) {
      throw new NotFoundException(`Предмет з id: ${id} не знайдений `)
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

  async getCoursesDropdown(
    options: IPaginationOptions,
    orderByColumn: CourseColumns,
    orderBy: 'ASC' | 'DESC',
    courseName: string,
    type: CourseType,
    teacherId: number,
    curatorId: number,
    semester: SEMESTER,
  ) {
    orderByColumn = orderByColumn || CourseColumns.ID
    orderBy = orderBy || 'ASC'

    const courses = await this.coursesRepository
      .createQueryBuilder('Course')
      .leftJoinAndSelect('Course.groups', 'Group')

    if (courseName) {
      courses.andWhere(`LOWER(Course.name) LIKE LOWER(:name)`, { name: `%${courseName}%` })
    }

    if (type) {
      courses.andWhere('Course.type=:type', { type })
    }

    if (teacherId) {
      courses.andWhere('Course.teacherId=:teacherId', { teacherId })
    }

    if (curatorId) {
      courses.andWhere('Group.curatorId=:curatorId', { curatorId })
    }

    if (semester) {
      courses.andWhere('Course.semester=:semester', { semester })
    }

    courses.orderBy(`Course.${orderByColumn}`, orderBy)
    return await paginateAndPlainToClass(GetCourseDropdownResponseDto, courses, options)
  }
}
