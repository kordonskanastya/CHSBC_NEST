import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetVotingDto } from './get-voting.dto'
import { GetStudentForGradeDto } from '../../students/dto/get-student-for-grade.dto'

export class GetVotingResultStudentDto {
  @Expose()
  @Type(() => GetStudentForGradeDto)
  @ApiProperty({ type: GetStudentForGradeDto })
  student: GetStudentForGradeDto

  @Expose()
  @ApiProperty({ type: Boolean })
  isVoted: boolean

  @Expose()
  @Type(() => GetVotingDto)
  @ApiProperty({ type: GetVotingDto })
  vote: GetVotingDto
}
