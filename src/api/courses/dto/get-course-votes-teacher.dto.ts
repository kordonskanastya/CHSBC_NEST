import { Expose, Type } from 'class-transformer'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from './get-course-dropdown-response.dto'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetCourseVotesTeacherDto extends PartialType(GetCourseDropdownResponseDto) {
  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  @ApiProperty({ type: GetUserDropdownResponseDto })
  teacher: GetUserDropdownResponseDto

  @Expose()
  @ApiProperty({ type: Number })
  allVotes: number
}
