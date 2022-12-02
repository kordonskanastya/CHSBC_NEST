import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { In, Repository } from 'typeorm'
import { TokenDto } from '../../auth/dto/token.dto'
import { ROLE } from '../../auth/roles/role.enum'
import { GRADE_REPOSITORY, STUDENT_REPOSITORY } from '../../constants'
import { checkColumnExist, enumToArray, enumToObject } from '../../utils/common'
import { paginateAndPlainToClass } from '../../utils/paginate'
import { UpdateResponseDto } from '../common/dto/update-response.dto'
import { Group } from '../groups/entities/group.entity'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { CreateStudentResponseDto } from './dto/create-student-response.dto'
import { CreateStudentDto } from './dto/create-student.dto'
import { GetStudentResponseDto } from './dto/get-student-response.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { Student } from './entities/student.entity'
import { GetStudentDropdownNameDto } from './dto/get-student-dropdown-name.dto'
import { Grade } from '../grades/entities/grade.entity'
import { Course } from '../courses/entities/course.entity'
import { GetStudentIndividualPlanDto } from './dto/get-student-individual-plan.dto'
import { ExelService } from '../../services/exel.service'
import { CourseType, SEMESTER } from '../courses/courses.service'
import { UpdateIndividualPlanDto } from './dto/update-individual-plan.dto'

export enum StudentColumns {
  ID = 'id',
  DATE_OF_BIRTH = 'dateOfBirth',
  GROUP_ID = 'groupId',
  STUDENT_ID = 'studentId',
  ORDER_NUMBER = 'orderNumber',
  EDEBO_ID = 'edeboId',
  IS_FULL_TIME = 'isFullTime',
  UPDATED = 'updated',
  CREATED = 'created',
}

export const STUDENT_COLUMN_LIST = enumToArray(StudentColumns)
export const STUDENT_COLUMNS = enumToObject(StudentColumns)

@Injectable()
export class StudentsService {
  User: any

  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentsRepository: Repository<Student>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(
    { user, ...createStudentDto }: CreateStudentDto,
    tokenDto?: TokenDto,
  ): Promise<CreateStudentResponseDto> {
    const { sub } = tokenDto

    const group = await Group.findOne(createStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(`Групу з id: ${createStudentDto.groupId},не знайдено`)
    }

    if (await this.findOneByEdeboId(createStudentDto.edeboId)) {
      throw new BadRequestException(`Студент з таким ЕДЕБО : ${createStudentDto.edeboId} вже існує`)
    }

    if (user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`Користувач не може бути зареєстрованим ,бо має роль: ${user.role}`)
    }

    const { id: userId } = await this.usersService.create(user, tokenDto)
    const student = await this.studentsRepository
      .create({
        ...createStudentDto,
        group,
        user: await User.findOne(userId),
      })
      .save({
        data: {
          id: sub,
        },
      })

    if (!student) {
      throw new BadRequestException('Не вишло створити студента')
    } else {
      const group_ = await Group.findOne(group.id, { relations: ['courses'] })
      const student_ = await Student.findOne(student.id, { relations: ['courses'] })

      group_.courses.map(async (course) => {
        if (course.type === CourseType.PROFESSIONAL_COMPETENCE || course.type === CourseType.GENERAL_COMPETENCE) {
          student_.courses.push(course)
          await this.gradeRepository.create({ grade: 0, student: student_, course }).save({
            data: { id: sub },
          })
        }
      })

      Object.assign(student_, { ...student_, courses: student_.courses })
      await student_.save({ data: { id: sub } })
    }

    return plainToClass(CreateStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  async findAllWithPagination(
    options: IPaginationOptions,
    search: string,
    orderByColumn: StudentColumns,
    orderBy: 'ASC' | 'DESC',
    id: number,
    firstName: string,
    lastName: string,
    patronymic: string,
    email: string,
    group: number,
    orderNumber: string,
    edeboId: string,
    isFullTime: boolean,
  ) {
    orderByColumn = orderByColumn || StudentColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(STUDENT_COLUMN_LIST, orderByColumn)

    const query = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.group', 'group')
      .where('user.role = :role', {
        role: 'student',
      })

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(student.group), LOWER(student.orderNumber), LOWER(student.edeboId), LOWER(student.isFullTime)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (id) {
      query.andWhere('Student.id=:id', { id })
    }

    if (firstName) {
      query.andWhere(`LOWER(user.firstName) LIKE LOWER('%${firstName}%')`)
    }

    if (lastName) {
      query.andWhere(`LOWER(user.lastName) LIKE LOWER('%${lastName}%')`)
    }

    if (patronymic) {
      query.andWhere(`LOWER(user.patronymic) LIKE LOWER('%${patronymic}%')`)
    }

    if (email) {
      query.andWhere(`LOWER(user.email) LIKE LOWER('%${email}%')`)
    }

    if (group) {
      query.andWhere('student.group = :group', {
        group,
      })
    }

    if (orderNumber) {
      query.andWhere(`LOWER(student.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }

    if (edeboId) {
      query.andWhere(`LOWER(student.edeboId) LIKE LOWER('%${edeboId}%')`)
    }

    if (isFullTime !== undefined) {
      query.andWhere(`student.isFullTime = :isFullTime`, { isFullTime })
    }

    query.orderBy(`student.${orderByColumn}`, orderBy)

    return await paginateAndPlainToClass(GetStudentResponseDto, query, options)
  }

  async findAllWithoutPagination(
    search: string,
    orderByColumn: StudentColumns,
    orderBy: 'ASC' | 'DESC',
    id: number,
    firstName: string,
    lastName: string,
    patronymic: string,
    email: string,
    group: number,
    orderNumber: string,
    edeboId: string,
    isFullTime: boolean,
  ) {
    orderByColumn = orderByColumn || StudentColumns.ID
    orderBy = orderBy || 'ASC'

    checkColumnExist(STUDENT_COLUMN_LIST, orderByColumn)

    const query = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.group', 'group')
      .where('user.role = :role', {
        role: 'student',
      })

    if (search) {
      query.andWhere(
        // eslint-disable-next-line max-len
        `concat_ws(' ', LOWER(student.group), LOWER(student.orderNumber), LOWER(student.edeboId), LOWER(student.isFullTime)) LIKE LOWER(:search)`,
        {
          search: `%${search}%`,
        },
      )
    }

    if (id) {
      query.andWhere('Student.id=:id', { id })
    }

    if (firstName) {
      query.andWhere(`LOWER(user.firstName) LIKE LOWER('%${firstName}%')`)
    }

    if (lastName) {
      query.andWhere(`LOWER(user.lastName) LIKE LOWER('%${lastName}%')`)
    }

    if (patronymic) {
      query.andWhere(`LOWER(user.patronymic) LIKE LOWER('%${patronymic}%')`)
    }

    if (email) {
      query.andWhere(`LOWER(user.email) LIKE LOWER('%${email}%')`)
    }

    if (group) {
      query.andWhere('student.group = :group', {
        group,
      })
    }

    if (orderNumber) {
      query.andWhere(`LOWER(student.orderNumber) LIKE LOWER('%${orderNumber}%')`)
    }

    if (edeboId) {
      query.andWhere(`LOWER(student.edeboId) LIKE LOWER('%${edeboId}%')`)
    }

    if (isFullTime !== undefined) {
      query.andWhere(`student.isFullTime = :isFullTime`, { isFullTime })
    }

    query.orderBy(`student.${orderByColumn}`, orderBy)

    return plainToClass(GetStudentResponseDto, query.getMany(), { excludeExtraneousValues: true })
  }

  async findOne(id: number): Promise<GetStudentResponseDto> {
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    if (!student) {
      throw new NotFoundException(`Студента з id: ${id} не знайдено`)
    }

    return plainToClass(GetStudentResponseDto, student, { excludeExtraneousValues: true })
  }

  async findOneByEdeboId(edeboId: string): Promise<GetStudentResponseDto> {
    const student = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .where({ edeboId })
      .getOne()

    if (student) {
      throw new BadRequestException(`Студент з таким ЕДЕБО : ${edeboId} вже існує`)
    }

    return plainToClass(GetStudentResponseDto, student, {
      excludeExtraneousValues: true,
    })
  }

  async update(
    id: number,
    { user, ...updateStudentDto }: UpdateStudentDto,
    { sub, role }: TokenDto,
  ): Promise<UpdateResponseDto> {
    if (user && user.role && user.role !== ROLE.STUDENT) {
      throw new BadRequestException(`Студент не може бути змінений , бо має роль :${user.role}`)
    }

    const student = await this.studentsRepository.findOne(id)
    if (!student) {
      throw new NotFoundException(`Студент з id: ${id} не знайдений`)
    }

    Object.assign(student, updateStudentDto)

    const group = await Group.findOne(updateStudentDto.groupId)
    if (!group) {
      throw new BadRequestException(` Група з іd: ${updateStudentDto.groupId} не існує`)
    }

    const {
      user: { id: userId },
    } = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    Object.assign(student, { ...updateStudentDto, group })

    try {
      if (user) {
        const newPassword = Buffer.from(Math.random().toString()).toString('base64').substring(0, 8)
        await this.usersService.update(userId, { ...user, password: newPassword }, { sub, role })
      }
      await student.save({
        data: {
          id: sub,
        },
      })
    } catch (e) {
      throw new NotAcceptableException('Не вишло зберегти студента. ' + e.message)
    }
    return {
      success: true,
    }
  }

  async remove(id: number, userId?: number) {
    const student = await this.studentsRepository.findOne(id)

    if (!student) {
      throw new NotFoundException(`Студент з id: ${id} не знайдений `)
    }

    const {
      user: { id: userIdDeleted },
    } = await this.studentsRepository
      .createQueryBuilder('Student')
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoinAndSelect('Student.group', 'Group')
      .andWhere({ id })
      .getOne()

    try {
      await this.studentsRepository.remove(student, {
        data: {
          id: userId,
        },
      })

      await this.usersService.remove(userIdDeleted, userId)

      return { success: true }
    } catch (e) {
      throw new NotAcceptableException('Не вишло видалити студента. ' + e.message)
    }
  }

  async dropdownStudent(teacherId: number, curatorId: number) {
    const students = await this.studentsRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Student.user', 'User')
      .leftJoin('Student.group', 'Group')
      .leftJoin('Student.courses', 'Course')
      .where('User.role=:role', { role: ROLE.STUDENT })

    if (teacherId) {
      students.andWhere('Course.teacherId=:teacherId', { teacherId })
    }

    if (curatorId) {
      students.andWhere('Group.curatorId=:curatorId', { curatorId })
    }

    return plainToClass(GetStudentDropdownNameDto, students.getMany(), { excludeExtraneousValues: true })
  }

  async getIndividualPlan(userId: number, semester: SEMESTER) {
    const studentQuery = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoin('Student.courses', 'Student_course')
      .leftJoinAndSelect('Grade.course', 'Grade_Course')
      .leftJoinAndSelect('Grade_Course.teacher', 'Teacher')
      .leftJoinAndSelect('Student.user', 'User')
      .where('User.id=:userId', { userId })
      .andWhere('Student_course.id=Grade_Course.id')

    const student = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Student.user', 'User')
      .where('User.id=:userId', { userId })
      .getOne()

    if (!student) {
      throw new BadRequestException(`Студента не знайдено`)
    }

    if (!(await studentQuery.getOne())) {
      Object.assign(student, { ...student, grades: [] })
      return plainToClass(GetStudentIndividualPlanDto, student, { excludeExtraneousValues: true })
    }

    if (semester) {
      studentQuery.andWhere('Grade_Course.semester=:semester', { semester })
    }

    if (!(await studentQuery.getOne())) {
      throw new NotFoundException(
        `Індивідуальний план для студента ${await User.findOne(userId).then(
          (user) => user.lastName + ' ' + user.firstName[0] + '.' + user.patronymic[0],
        )}  для ${semester} семестру не знайдений `,
      )
    }

    return plainToClass(GetStudentIndividualPlanDto, studentQuery.getOne(), { excludeExtraneousValues: true })
  }

  async downloadIndividualPlan(id: number, semester: SEMESTER) {
    const student = await this.getIndividualPlan(id, semester)
    try {
      return await new ExelService().exportIndividualPlanToExcel(student)
    } catch (e) {
      throw new BadRequestException(e)
    }
  }

  async editIndividualPlan(id: number, updateIndividualPlan: UpdateIndividualPlanDto, token: TokenDto) {
    const { sub } = token
    const student = await Student.createQueryBuilder()
      .leftJoinAndSelect('Student.grades', 'Grade')
      .leftJoinAndSelect('Student.courses', 'Student_course')
      .leftJoinAndSelect('Grade.course', 'Course')
      .leftJoinAndSelect('Course.teacher', 'Teacher')
      .leftJoinAndSelect('Student.user', 'User')
      .where('User.id=:id', { id })
      .andWhere('Student_course.id=Course.id')
      .getOne()

    if (!student) {
      throw new NotFoundException(
        `Індивідуальний план для студента ${await User.findOne(id).then(
          (user) => user.lastName + ' ' + user.firstName[0] + '.' + user.patronymic[0] || '',
        )}  не знайдений `,
      )
    }
    const coursesIds_ = Array.isArray(updateIndividualPlan.courses)
      ? updateIndividualPlan.courses
      : [updateIndividualPlan.courses]
    const courses = await Course.findByIds(coursesIds_)

    if (!courses || courses.length !== coursesIds_.length) {
      throw new BadRequestException(`Предмет з іd: ${updateIndividualPlan.courses} не існує .`)
    }

    const studentRequiredCourses = []
    let studentNotRequiredCourses = []

    student.courses.map((course) => {
      if (course.type === CourseType.GENERAL_COMPETENCE || course.type === CourseType.PROFESSIONAL_COMPETENCE) {
        studentRequiredCourses.push(course)
      } else {
        studentNotRequiredCourses.push(course)
      }
    })

    let deletedCoursesArrayId, insertedArrayCoursesId
    const hash = Object.create(null)

    studentNotRequiredCourses.forEach(function (course) {
      hash[course.id] = { value: course.id }
    })

    studentNotRequiredCourses = Object.keys(hash).map(function (k) {
      return hash[k].value
    })

    // eslint-disable-next-line prefer-const
    deletedCoursesArrayId = Object.keys(hash).map(function (k) {
      return hash[k].value
    })

    // eslint-disable-next-line prefer-const
    insertedArrayCoursesId = updateIndividualPlan.courses.filter(function (a) {
      const r = !hash[a]
      if (hash[a]) {
        delete hash[a]
      }
      return r
    })

    const deletedCourses = await Grade.find({ where: { course: In(deletedCoursesArrayId) } })
    deletedCourses.map(async (course) => {
      await course.remove({ data: { id: sub } })
    })

    const coursesForCreateGrade = await Course.find({ where: { id: In(insertedArrayCoursesId) } })

    coursesForCreateGrade.map(async (course) => {
      await Grade.create({ course, student, grade: 0 }).save({ data: { id: sub } })
    })

    Object.assign(student, { ...student, courses: [...studentRequiredCourses, ...courses] })

    try {
      await student.save({ data: { id: sub } })
      return {
        message: 'Індивідуальний план успішно відредагований',
        success: true,
      }
    } catch (e) {
      throw new BadRequestException('Не вишло зберегти індивідуальний план.' + e.message)
    }
  }
}

// systemctl stop csbc-dev.service
// systemctl start csbc-dev.service
