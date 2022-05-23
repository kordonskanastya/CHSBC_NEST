import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

class UserResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  email: string

  @Expose()
  @ApiProperty({ type: String })
  role: string
}

export class GetLoggerResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  event: string

  @Expose()
  @ApiProperty({ type: String })
  entity: string

  @Expose()
  @ApiProperty({ type: Number })
  entityId: number

  @Expose()
  @ApiProperty({ type: Date })
  created: Date

  @Expose()
  @ApiProperty({ type: Date })
  updated: Date

  @Expose()
  @ApiProperty({ type: UserResponseDto })
  @Type(() => UserResponseDto)
  user: UserResponseDto
}
