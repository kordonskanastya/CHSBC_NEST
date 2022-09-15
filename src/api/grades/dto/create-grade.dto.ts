import { IsNumber, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateGradeDto {
  @IsNumber()
  @ApiProperty({ example: 3 })
  studentId: number

  @IsNumber()
  @ApiProperty({ example: 1 })
  courseId: number

  @IsNumber()
  @Min(0, { message: 'Мінімальне  значення оцінки 100' })
  @Max(100, { message: 'Максимальне значення оцінки 100' })
  @ApiProperty({ example: 1 })
  grade: number
}
