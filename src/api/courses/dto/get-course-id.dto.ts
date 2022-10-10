import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class GetCourseIdDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number
}
