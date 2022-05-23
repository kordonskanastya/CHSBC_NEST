import { IsEmail, IsEnum, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import * as faker from 'faker'
import { FAKE_EMAIL } from '../../../constants'
import { ROLE } from '../../../auth/roles/role.enum'
import { StudentData } from './student-data.dto'
import { Type } from 'class-transformer'

export class CreateUserDto {
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

  @IsObject()
  @ApiPropertyOptional({ type: StudentData })
  @Type(() => StudentData)
  studentData: StudentData
}
