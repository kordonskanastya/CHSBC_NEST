import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { FAKE_EMAIL } from '../../constants'
import * as faker from 'faker'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { LoginUserDto } from './login-user.dto'
import { ROLE } from '../roles/role.enum'

interface studentData {
  dateOfBirth: string
  group: string
  orderNumber: string
  edeboId: string
  isFullTime: boolean
}

export class RegisterDto extends PartialType(LoginUserDto) {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(2)
  @MaxLength(200)
  @ApiPropertyOptional({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(2)
  @MaxLength(200)
  @ApiPropertyOptional({ required: true, example: faker.name.lastName() })
  lastName: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(2)
  @MaxLength(200)
  @ApiPropertyOptional({ required: true, example: faker.name.patronymic() })
  patronymic: string

  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @IsEmail()
  @MaxLength(320)
  @ApiPropertyOptional({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(1)
  @MaxLength(200)
  @ApiPropertyOptional({ required: true, example: faker.name.role() })
  role: ROLE

  @ApiPropertyOptional({ required: true, example: faker.name.role() })
  studentData?: studentData
}
