import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class ForgotPasswordResultDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  success: boolean

  @IsString()
  @ApiPropertyOptional({ type: String })
  message?: string
}
