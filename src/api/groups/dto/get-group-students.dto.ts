import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateGroupResponseDto } from './create-group-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetStudentForGradeDto } from '../../students/dto/get-student-for-grade.dto'

export class GetGroupStudentsDto extends PartialType(CreateGroupResponseDto) {
  @Expose()
  @Type(() => GetStudentForGradeDto)
  @ApiProperty({ type: GetStudentForGradeDto })
  students: GetStudentForGradeDto
}
