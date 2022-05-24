import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'
import * as faker from 'faker'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { LoginUserDto } from './login-user.dto'

export class SendMailDto extends LoginUserDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.lastName() })
  lastName: string
}
