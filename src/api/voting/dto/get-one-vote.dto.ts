import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'
import { GetCourseDropdownResponseDto } from '../../courses/dto/get-course-dropdown-response.dto'

export class GetOneVoteDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @Type(() => GetGroupResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  groups: GetGroupResponseDto

  @Expose()
  @ApiProperty({ type: Date })
  startDate: Date

  @Expose()
  @ApiProperty({ type: Date })
  endDate: Date

  @Expose()
  @Type(() => GetCourseDropdownResponseDto)
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  requiredCourses: GetCourseDropdownResponseDto

  @Expose()
  @Type(() => GetCourseDropdownResponseDto)
  @ApiProperty({ type: GetCourseDropdownResponseDto })
  notRequiredCourses: GetCourseDropdownResponseDto
}
