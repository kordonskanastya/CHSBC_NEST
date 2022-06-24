import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetUserResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  firstName: string

  @Expose()
  @ApiProperty({ type: String })
  lastName: string

  @Expose()
  @ApiProperty({ type: String })
  patronymic: string

  @Expose()
  @ApiPropertyOptional({ type: String })
  email: string

  @Expose()
  @ApiProperty({ type: String })
  role: string

  @Expose()
  @ApiProperty({ type: Date })
  updated: Date

  @Expose()
  @ApiProperty({ type: Date })
  created: Date
}
