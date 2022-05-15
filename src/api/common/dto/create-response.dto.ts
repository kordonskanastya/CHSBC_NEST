import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class CreateResponseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number
}
