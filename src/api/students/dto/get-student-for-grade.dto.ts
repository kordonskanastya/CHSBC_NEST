import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetCourseGradeDto } from '../../courses/dto/get-course-grade.dto'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetStudentForGradeDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: GetUserDropdownResponseDto })
  @Type(() => GetUserDropdownResponseDto)
  user: GetUserDropdownResponseDto

  @Expose()
  @Type(() => GetCourseGradeDto)
  @ApiProperty({ type: GetCourseGradeDto })
  courses: GetCourseGradeDto
}
