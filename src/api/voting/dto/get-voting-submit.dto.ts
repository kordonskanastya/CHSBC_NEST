import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'
import { GetCourseSemesterTeacherDto } from '../../courses/dto/get-course-semester-teacher.dto'

export class GetVotingSubmitDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  groups: CreateGroupResponseDto

  @Expose()
  @ApiProperty({ type: Date })
  startDate: Date

  @Expose()
  @Type(() => GetCourseSemesterTeacherDto)
  @ApiProperty({ type: GetCourseSemesterTeacherDto })
  requiredCourses: GetCourseSemesterTeacherDto

  @Expose()
  @Type(() => GetCourseSemesterTeacherDto)
  @ApiProperty({ type: GetCourseSemesterTeacherDto })
  notRequiredCourses: GetCourseSemesterTeacherDto
}
