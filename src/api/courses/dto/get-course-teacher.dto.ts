import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetCourseTeacherDto {
  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @ApiProperty({ type: GetUserDropdownResponseDto })
  @Type(() => GetUserDropdownResponseDto)
  teacher: GetUserDropdownResponseDto
}
