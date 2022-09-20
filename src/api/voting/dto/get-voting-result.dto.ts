import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetCourseTeacherDto } from '../../courses/dto/get-course-teacher.dto'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'
import { GetStudentForVotingResult } from '../../students/dto/get-student-for-voting-result'

export class GetVotingResultDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  tookPart: number

  @Expose()
  @ApiProperty({ type: String })
  status: string

  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  groups: CreateGroupResponseDto

  @Expose()
  @ApiProperty({ type: Date })
  startDate: Date

  @Expose()
  @Type(() => GetStudentForVotingResult)
  students: GetStudentForVotingResult

  @Expose()
  @Type(() => GetCourseTeacherDto)
  courses: GetCourseTeacherDto
}
