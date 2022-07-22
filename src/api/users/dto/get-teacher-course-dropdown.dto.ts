import { Expose, Type } from 'class-transformer'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'
import { ApiProperty } from '@nestjs/swagger'

export class GetTeacherCourseDropdownDto {
  @Expose()
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  @Type(() => GetCourseDropdownResponseDto)
  courses: GetCourseDropdownResponseDto
}
