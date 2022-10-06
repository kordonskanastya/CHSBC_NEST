import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { CourseType, SEMESTER } from '../courses.service'

export class CreateCourseDto {
  @IsString()
  @MinLength(2, { message: 'Назва предмету  має містити 2 та більше символи' })
  @MaxLength(50, { message: 'Назва предмету може містити максимум 50 символів' })
  @ApiProperty({ required: true, example: 'English b1-1' })
  name: string

  @IsNumber()
  @ApiProperty({ required: true, example: 15 })
  credits: number

  @IsNumber()
  @ApiProperty({ required: true, example: 48 })
  lectureHours: number

  @IsBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean

  @IsBoolean()
  @ApiProperty({ required: true, example: false })
  isExam: boolean

  @IsEnum(SEMESTER, { message: 'Семестер має бути дійсним' })
  @ApiProperty({ required: true, example: SEMESTER.FIRST })
  semester: SEMESTER

  @IsEnum(CourseType, { message: 'Тип предмету не дійсний,перевірте тип' })
  @ApiProperty({ required: true, example: CourseType.GENERAL_COMPETENCE })
  type: CourseType

  @IsNumber()
  @ApiProperty({ required: true, example: 23 })
  teacher: number

  @IsArray()
  @ApiProperty({ required: true, example: [43, 12] })
  groups: number[]
}
