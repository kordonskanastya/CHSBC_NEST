import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import * as faker from 'faker'
import { FAKE_EMAIL } from '../../../constants'
import { ROLE } from '../../../auth/roles/role.enum'
import { Transform, TransformFnParams } from 'class-transformer'

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: "Ім'я має містити 2 та більше символи" })
  @MaxLength(30, { message: "Ім'я може містити максимум 30 символів" })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @MinLength(2, { message: 'Прізвище має містити 2 та більше символи' })
  @MaxLength(30, { message: 'Прізвище може містити максимум 30 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.lastName() })
  lastName: string

  @IsString()
  @MinLength(2, { message: 'По-батькові має містити 2 та більше символи' })
  @MaxLength(30, { message: 'По-батькові може містити максимум 30 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: 'ivanovych' })
  patronymic: string

  @IsEmail({}, { message: 'Електронна адреса має бути дійсною' })
  @MinLength(5, { message: 'Електронна пошта має містити 5 та більше символів' })
  @MaxLength(100, { message: 'Електронна пошта може містити максимум 100 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsEnum(ROLE, { message: 'Роль має бути дійсним значенням enum' })
  @ApiProperty({ default: ROLE.TEACHER, enum: ROLE })
  role: ROLE
}
