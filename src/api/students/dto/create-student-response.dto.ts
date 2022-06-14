import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'
import { Expose } from 'class-transformer'

export class CreateStudentResponseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number
}
