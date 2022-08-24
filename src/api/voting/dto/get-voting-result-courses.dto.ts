import { OmitType, PartialType } from '@nestjs/swagger'
import { GetVotingDto } from './get-voting.dto'
import { Expose, Type } from 'class-transformer'
import { GetCourseTeacherDto } from '../../courses/dto/get-course-teacher.dto'
import { GetStudentDropdownNameDto } from '../../students/dto/get-student-dropdown-name.dto'

export class GetVotingResultCoursesDto extends PartialType(OmitType(GetVotingDto, ['endDate', 'allStudents'])) {
  @Expose()
  @Type(() => GetCourseTeacherDto)
  courses: GetCourseTeacherDto

  @Expose()
  @Type(() => GetStudentDropdownNameDto)
  students: GetStudentDropdownNameDto
}
