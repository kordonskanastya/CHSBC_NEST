import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'

export class GetGradeForIndividualPlanDto {
  @Expose()
  id: number

  @Expose()
  @ApiProperty({ type: Number })
  grade: number

  @Expose()
  @ApiProperty({ type: GetCourseResponseDto })
  @Type(() => GetCourseResponseDto)
  course: GetCourseResponseDto
}
