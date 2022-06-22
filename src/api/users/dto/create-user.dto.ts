import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import * as faker from 'faker'
import { FAKE_EMAIL } from '../../../constants'
import { ROLE } from '../../../auth/roles/role.enum'
import { Transform, TransformFnParams, Type } from 'class-transformer'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.lastName() })
  lastName: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: 'ivanovych' })
  patronymic: string

  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsEnum(ROLE)
  @ApiProperty({ default: ROLE.TEACHER, enum: ROLE })
  role: ROLE
}
