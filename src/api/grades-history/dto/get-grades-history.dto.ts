import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from '../../students/dto/get-student-dropdown-name.dto'
import { Expose, Type } from 'class-transformer'
import { GetGradesHistoryResponseDto } from './get-grades-history-response.dto'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'

export class GetGradesHistoryDto extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  group: CreateGroupResponseDto

  @Expose()
  @Type(() => GetGradesHistoryResponseDto)
  @ApiProperty({ type: GetGradesHistoryResponseDto })
  gradesHistories: GetGradesHistoryResponseDto
}
