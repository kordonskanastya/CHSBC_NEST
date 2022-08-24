import { OmitType, PartialType } from '@nestjs/swagger'
import { GetVotingDto } from './get-voting.dto'
import { Expose, Type } from 'class-transformer'
import { GetCourseTeacherDto } from '../../courses/dto/get-course-teacher.dto'

export class GetVotingResultCoursesDto extends PartialType(OmitType(GetVotingDto, ['endDate', 'allStudents'])) {
  @Expose()
  @Type(() => GetCourseTeacherDto)
  courses: GetCourseTeacherDto
}
