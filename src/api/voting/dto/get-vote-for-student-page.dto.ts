import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'
import { GetStudentVoteDto } from './get-student-vote.dto'

export class GetVoteForStudentPageDto {
  @Expose()
  @ApiProperty({ type: Date })
  startDate: Date

  @Expose()
  @ApiProperty({ type: Date })
  endDate: Date

  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  requiredCourses: GetCourseResponseDto

  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  notRequiredCourses: GetCourseResponseDto

  @Expose()
  @ApiProperty({ type: Boolean })
  isRevote: boolean

  @Expose()
  approveCourse: number[]

  @Expose()
  @Type(() => GetStudentVoteDto)
  studentVotes: GetStudentVoteDto
}
