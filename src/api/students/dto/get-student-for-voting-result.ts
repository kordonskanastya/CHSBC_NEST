import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from './get-student-dropdown-name.dto'
import { Expose } from 'class-transformer'

export class GetStudentForVotingResult extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @ApiProperty({ type: Boolean })
  isVoted: boolean
}
