import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'
import * as faker from 'faker'

export default class StudentData {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  dateOfBirth: string

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  group: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  orderNumber: string

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: faker.name.firstName() })
  edeboId: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
