import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetCourseDropdownResponseDto } from './get-course-dropdown-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetGradeResponseDto } from '../../grades/dto/get-grade-response.dto'

export class GetCourseGradeDto extends PartialType(GetCourseDropdownResponseDto) {
  @Expose()
  @Type(() => GetGradeResponseDto)
  @ApiProperty({ type: Number })
  grades: GetGradeResponseDto
}
