import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsNumber, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @IsNumber()
  @ApiProperty({ required: true, example: 15 })
  groupId: number

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '6724534082924' })
  orderNumber: string

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '12345678' })
  edeboId: string

  @IsBoolean()
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
