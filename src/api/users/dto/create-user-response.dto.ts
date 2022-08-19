import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class CreateUserResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @ApiProperty({ type: String })
  role: string
}
