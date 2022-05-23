import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { FAKE_EMAIL } from '../../constants'
import * as faker from 'faker'
import { Transform, Type } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ROLE } from '../roles/role.enum'
import { StudentData } from '../../api/users/dto/student-data.dto'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  firstName: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.lastName() })
  lastName: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: 'ivanovych' })
  patronymic: string

  @IsEmail()
  @MaxLength(320)
  @ApiProperty({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsEnum(ROLE)
  @ApiProperty({ default: ROLE.STUDENT, enum: ROLE })
  role: ROLE

  @IsString()
  @MinLength(6, {
    message: 'The string must be greater than 6 characters. No spaces are allowed at the beginning or end of a line.',
  })
  @ApiPropertyOptional({ example: 'cghybjbtc' })
  password: string

  @IsObject()
  @ApiPropertyOptional({ type: StudentData })
  @Type(() => StudentData)
  studentData: StudentData
}
