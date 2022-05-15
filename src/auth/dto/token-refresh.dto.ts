import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class TokenRefreshDto {
  @IsString()
  @ApiProperty({ type: String })
  sub: string

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  refresh: true
}
