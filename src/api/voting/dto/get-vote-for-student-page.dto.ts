import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'

export class GetVoteForStudentPageDto {
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
}
