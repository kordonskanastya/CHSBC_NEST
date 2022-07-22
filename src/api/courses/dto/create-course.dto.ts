import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString, MaxLength, MinLength } from 'class-validator'

enum SEMESTER {
  'FIRST' = 1,
  'SECOND' = 2,
}

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
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

  @IsEnum(SEMESTER)
  @ApiProperty({ required: true, example: SEMESTER.FIRST })
  semester: SEMESTER

  @IsBoolean()
  @ApiProperty({ required: true, example: false })
  isCompulsory: boolean

  @IsNumber()
  @ApiProperty({ required: true, example: 23 })
  teacher: number

  @IsArray()
  @ApiProperty({ required: true, example: [43, 12] })
  groups: number[]
}
