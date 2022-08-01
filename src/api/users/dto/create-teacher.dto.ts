import { CreateUserDto } from './create-user.dto'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

export class CreateTeacherDto extends PartialType(CreateUserDto) {
  @IsArray()
  @ApiProperty({ required: false, example: [43, 12] })
  courses: number[]
}
