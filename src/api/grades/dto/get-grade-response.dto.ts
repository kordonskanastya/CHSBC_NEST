import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'

export class GetGradeResponseDto {
  @Expose()
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  grade: number

  @Expose()
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  @Type(() => GetCourseDropdownResponseDto)
  course: GetCourseDropdownResponseDto
}
