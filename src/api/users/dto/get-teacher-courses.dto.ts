import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetUserResponseDto } from './get-user-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'

export class GetTeacherCoursesDto extends PartialType(GetUserResponseDto) {
  @Expose()
  @Type(() => GetCourseResponseDto)
  @ApiProperty({ type: GetCourseResponseDto })
  courses: GetCourseResponseDto
}
