import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from './get-course-dropdown-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetCourseForVotingResultDto extends PartialType(GetCourseDropdownResponseDto) {
  @Expose()
  @ApiProperty({ type: Number })
  semester: number

  @Expose()
  @ApiProperty({ type: String })
  type: string

  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  @ApiProperty({ type: GetUserDropdownResponseDto })
  teacher: GetUserDropdownResponseDto

  @Expose()
  @ApiProperty({ type: Number })
  allVotes: number
}
