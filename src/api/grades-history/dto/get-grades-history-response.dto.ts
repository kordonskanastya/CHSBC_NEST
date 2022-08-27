import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetGradesHistoryResponseDto {
  @Expose()
  id: number

  // @Expose()
  // @ApiProperty({ example: GetStudentDropdownNameDto })
  // @Type(() => GetStudentDropdownNameDto)
  // student: GetStudentDropdownNameDto

  @Expose()
  @ApiProperty({ type: Number })
  grade: number

  @Expose()
  @ApiProperty({ example: GetCourseDropdownResponseDto })
  @Type(() => GetCourseDropdownResponseDto)
  course: GetCourseDropdownResponseDto

  @Expose()
  @ApiProperty({ example: GetUserDropdownResponseDto })
  @Type(() => GetUserDropdownResponseDto)
  userChanged: GetUserDropdownResponseDto

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date

  @Expose()
  @ApiProperty({ type: String })
  reasonOfChange: string
}
