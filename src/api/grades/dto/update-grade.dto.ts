import { IsEnum, IsNumber, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ReasonForChangeGrade } from '../grades.service'

export class UpdateGradeDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  courseId: number

  @IsNumber()
  @Min(0, { message: 'Мінімальне  значення оцінки 0' })
  @Max(100, { message: 'Максимальне значення оцінки 100' })
  @ApiProperty({ example: 1 })
  grade: number

  @IsEnum(ReasonForChangeGrade)
  @ApiProperty({ default: ReasonForChangeGrade.RETAKE, enum: ReasonForChangeGrade })
  reasonForChange: ReasonForChangeGrade
}
