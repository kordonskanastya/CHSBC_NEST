import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetCourseDropdownResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string
}
