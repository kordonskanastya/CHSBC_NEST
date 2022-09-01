import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from './get-student-dropdown-name.dto'
import { Expose, Type } from 'class-transformer'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'

export class GetStudentForVotingResult extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  group: CreateGroupResponseDto

  @Expose()
  @ApiProperty({ type: Boolean })
  isVoted: boolean
}
