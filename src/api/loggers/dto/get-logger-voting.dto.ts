import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetLoggerVotingDto {
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
  @ApiProperty({ type: String })
  status: string
}
