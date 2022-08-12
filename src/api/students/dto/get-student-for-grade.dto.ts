import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetCourseGradeDto } from '../../courses/dto/get-course-grade.dto'

export class GetStudentForGradeDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @Type(() => GetCourseGradeDto)
  @ApiProperty({ type: GetCourseGradeDto })
  courses: GetCourseGradeDto

  // @Expose()
  // @Type(() => GetUserResponseDto)
  // @ApiProperty({ type: GetUserResponseDto })
  // user: GetUserResponseDto
}
