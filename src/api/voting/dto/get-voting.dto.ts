import { Expose, Type } from 'class-transformer'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'
import { ApiProperty } from '@nestjs/swagger'

export class GetVotingDto {
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
  @ApiProperty({ type: Number })
  tookPart: number

  @Expose()
  @ApiProperty({ type: Number })
  allStudents: number

  @Expose()
  @ApiProperty({ type: String })
  status: string
}
