import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class CreateCourseResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number
}
