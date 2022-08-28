import { PartialType } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from './get-course-dropdown-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetCourseTeacherDto extends PartialType(GetCourseDropdownResponseDto) {
  @Expose()
  semester: number

  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  teacher: GetUserDropdownResponseDto
}
