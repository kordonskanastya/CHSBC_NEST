import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetStudentResponseDto } from '../../students/dto/get-student-response.dto'
import { GetCourseResponseDto } from '../../courses/dto/get-course-response.dto'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'

export class GetGradesHistoryResponseDto {
  @Expose()
  id: number

  @Expose()
  @ApiProperty({ example: 3 })
  @Type(() => GetStudentResponseDto)
  student: GetStudentResponseDto

  @Expose()
  @ApiProperty({ type: Number })
  grade: number

  @Expose()
  @ApiProperty({ example: 1 })
  @Type(() => GetCourseResponseDto)
  course: GetCourseResponseDto

  @Expose()
  @ApiProperty({ example: 1 })
  @Type(() => GetUserResponseDto)
  userChanged: GetUserResponseDto

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date

  @Expose()
  @ApiProperty({ type: String })
  reasonOfChange: string
}
