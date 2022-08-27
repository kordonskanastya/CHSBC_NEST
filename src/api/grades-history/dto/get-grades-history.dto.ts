import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetStudentDropdownNameDto } from '../../students/dto/get-student-dropdown-name.dto'
import { Expose, Type } from 'class-transformer'
import { GetGradesHistoryResponseDto } from './get-grades-history-response.dto'

export class GetGradesHistoryDto extends PartialType(GetStudentDropdownNameDto) {
  @Expose()
  @Type(() => GetGradesHistoryResponseDto)
  @ApiProperty({ type: GetGradesHistoryResponseDto })
  gradesHistories: GetGradesHistoryResponseDto
}
