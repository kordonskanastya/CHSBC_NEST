import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SuccessResponseDto {
  @Expose()
  @ApiProperty()
  success: boolean
}
