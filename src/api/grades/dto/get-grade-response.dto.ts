import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class GetGradeResponseDto {
  @Expose()
  id: number
  @Expose()
  @ApiProperty({ type: Number })
  grade: number
}
