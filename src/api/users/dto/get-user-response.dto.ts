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
  @ApiPropertyOptional({ type: String })
  email: string
}
