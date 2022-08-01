import { IsArray } from 'class-validator'
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class UpdateTeacherDto extends PartialType(OmitType(CreateUserDto, ['role'])) {
  @IsArray()
  @ApiProperty({ required: false, example: [43, 12] })
  courses: number[]
}
