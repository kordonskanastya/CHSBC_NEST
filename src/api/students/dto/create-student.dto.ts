import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { CreateUserDto } from '../../users/dto/create-user.dto'

export class CreateStudentDto {
  @IsString()
  @MinLength(10, { message: 'Дата народження  має містити 10 символів' })
  @MaxLength(10, { message: 'Номер наказу може містити максимум 30 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @IsNumber()
  @ApiProperty({ required: true, example: 15, type: Number })
  groupId: number

  @IsObject()
  @ApiProperty({
    required: true,
    example: {
      firstName: 'Diego',
      lastName: 'Carroll',
      patronymic: 'Diegovych',
      email: 'Delmer67@hotmail.com',
      role: 'student',
    },
    type: Number,
  })
  user: CreateUserDto

  @IsString()
  @MinLength(6, { message: 'Номер наказу  має містити 6 та більше символів' })
  @MaxLength(30, { message: 'Номер наказу може містити максимум 30 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '6724534082924' })
  orderNumber: string

  @IsString()
  @MinLength(8, { message: 'ЄДЕБО ID  має містити 8 символів' })
  @MaxLength(8, { message: 'ЄДЕБО ID може містити максимум 8 символів' })
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '12345678' })
  edeboId: string

  @IsBoolean()
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
