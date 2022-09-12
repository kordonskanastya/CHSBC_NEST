import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from '../../students/dto/get-student-dropdown-name.dto'
import { Expose, Type } from 'class-transformer'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'
import { GetStudentGroupDto } from '../../students/dto/get-student-group.dto'

export class GetTeacherInfoDto extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @Type(() => GetStudentGroupDto)
  @ApiProperty({ type: GetStudentGroupDto })
  student: GetStudentGroupDto

  @Expose()
  @Type(() => GetCourseDropdownResponseDto)
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  course: GetCourseDropdownResponseDto

  @Expose()
  @ApiProperty({ type: Number })
  grade: number
}
