import { IsEnum, IsNumber, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ReasonForChangeGrade } from '../../grades/grades.service'

export class CreateGradesHistoryDto {
  @IsNumber()
  @ApiProperty({ example: 3 })
  studentId: number

  @IsNumber()
  @ApiProperty({ example: 1 })
  courseId: number

  @IsNumber()
  @ApiProperty({ example: 1 })
  userChangedId: number

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({ example: 1 })
  grade: number

  @IsEnum(ReasonForChangeGrade)
  @ApiProperty({ example: 'Exam' })
  reasonOfChange: ReasonForChangeGrade
}
