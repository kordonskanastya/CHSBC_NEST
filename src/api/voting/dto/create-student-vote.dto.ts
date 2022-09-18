import { IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateStudentVoteDto {
  @IsArray()
  @ApiProperty({ required: true, example: [1, 2] })
  courses: number[]
}
