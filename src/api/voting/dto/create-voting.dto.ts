import { IsArray, IsEnum, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { SEMESTER } from '../../courses/dto/create-course.dto'

export class CreateVotingDto {
  @IsArray()
  @ApiProperty({ required: true, example: [43, 12] })
  groups: number[]

  @IsString()
  @ApiProperty({ required: true, example: '2022-08-13T17:12:57.000Z' })
  startDate: Date

  @IsString()
  @ApiProperty({ required: true, example: '2022-08-14T17:12:57.000Z' })
  endDate: Date

  @IsEnum(SEMESTER)
  @ApiProperty({ required: true, example: SEMESTER.FIRST })
  semester: SEMESTER

  @IsArray()
  @ApiProperty({ required: true, example: [1, 2] })
  requiredCourses: number[]

  @IsArray()
  @ApiProperty({ required: true, example: [1, 2] })
  notRequiredCourses: number[]
}
