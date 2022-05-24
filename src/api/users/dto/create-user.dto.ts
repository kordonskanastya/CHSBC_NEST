import { IsEmail, IsEnum, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import * as faker from 'faker'
import { FAKE_EMAIL } from '../../../constants'
import { ROLE } from '../../../auth/roles/role.enum'
import { StudentData } from './student-data.dto'
import { Transform, TransformFnParams, Type } from 'class-transformer'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @ApiProperty({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @ApiProperty({ required: true, example: faker.name.lastName() })
  lastName: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @ApiProperty({ required: true, example: 'ivanovych' })
  patronymic: string

  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @ApiProperty({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsEnum(ROLE)
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @ApiProperty({ default: ROLE.STUDENT, enum: ROLE })
  role: ROLE

  @IsObject()
  @ApiPropertyOptional({ type: StudentData })
  @Type(() => StudentData)
  studentData: StudentData
}
