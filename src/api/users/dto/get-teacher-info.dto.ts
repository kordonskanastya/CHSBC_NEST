import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from '../../students/dto/get-student-dropdown-name.dto'
import { Expose, Type } from 'class-transformer'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'
import { GetGradeResponseDto } from '../../grades/dto/get-grade-response.dto'

export class GetTeacherInfoDto extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  group: CreateGroupResponseDto

  @Expose()
  @Type(() => GetCourseDropdownResponseDto)
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  courses: GetCourseDropdownResponseDto

  @Expose()
  @Type(() => GetGradeResponseDto)
  @ApiProperty({ type: GetGradeResponseDto })
  grades: GetGradeResponseDto
}
