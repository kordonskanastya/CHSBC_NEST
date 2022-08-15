import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class GetGradeResponseDto {
  @Expose()
  @Type(() => GetGradeResponseDto)
  @ApiProperty({ type: Number })
  grade: GetGradeResponseDto
}
