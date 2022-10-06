import { Expose, Type } from 'class-transformer'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'
import { GetCourseDropdownResponseDto } from './get-course-dropdown-response.dto'

export class GetCourseSemesterTeacherDto extends PartialType(GetCourseDropdownResponseDto) {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  semester: number

  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  @ApiProperty({ type: GetUserDropdownResponseDto })
  teacher: GetUserDropdownResponseDto

  @Expose()
  @ApiProperty({ type: Number })
  allVotes: number
}
