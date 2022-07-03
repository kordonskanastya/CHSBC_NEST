import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'

export class GetGroupResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  curator: GetUserResponseDto

  @Expose()
  @ApiProperty({ type: String })
  orderNumber: string

  @Expose()
  @ApiProperty({ type: Number })
  students: number
}
