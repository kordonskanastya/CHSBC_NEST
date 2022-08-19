import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class AuthUserDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  role: string
}
