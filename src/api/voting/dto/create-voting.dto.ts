import { IsArray, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateVotingDto {
  @IsArray()
  @ApiProperty({ required: true, example: [43, 12] })
  groups: number[]

  @IsString()
  @ApiProperty({ required: true, example: '2022-08-13 19:12:57' })
  startDate: string

  @IsString()
  @ApiProperty({ required: true, example: '2022-08-14 19:12:57' })
  endDate: string

  @IsArray()
  @ApiProperty({ required: true, example: [1, 2] })
  requiredCourses: number[]

  @IsArray()
  @ApiProperty({ required: true, example: [1, 2] })
  notRequiredCourses: number[]
}
