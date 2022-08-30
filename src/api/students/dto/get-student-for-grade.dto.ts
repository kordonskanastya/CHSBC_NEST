import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'
import { GetGradeResponseDto } from '../../grades/dto/get-grade-response.dto'

export class GetStudentForGradeDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: GetUserDropdownResponseDto })
  @Type(() => GetUserDropdownResponseDto)
  user: GetUserDropdownResponseDto

  @Expose()
  @Type(() => GetGradeResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  grades: GetGradeResponseDto

  @Expose()
  @Type(() => GetGroupResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  group: GetGroupResponseDto
}
