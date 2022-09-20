import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetStudentForVotingResult } from '../../students/dto/get-student-for-voting-result'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'

export class GetLoggerVotingResultDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @Type(() => GetStudentForVotingResult)
  students: GetStudentForVotingResult

  @Expose()
  @Type(() => GetCourseResponseDto)
  courses: GetCourseResponseDto
}
