import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'

export class GetGroupResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @ApiProperty({ type: GetUserResponseDto })
  curator: GetUserResponseDto

  @Expose()
  @ApiProperty({ type: String })
  orderNumber: string

  @Expose()
  @ApiProperty({ type: Date })
  updated: Date

  @Expose()
  @ApiProperty({ type: Date })
  created: Date
}
