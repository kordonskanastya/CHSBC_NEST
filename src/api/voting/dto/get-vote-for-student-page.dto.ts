import { Expose, Type } from 'class-transformer'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'
import { ApiProperty } from '@nestjs/swagger'

export class GetVoteForStudentPageDto {
  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  requiredCourses: GetCourseResponseDto

  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  notRequiredCourses: GetCourseResponseDto
}
