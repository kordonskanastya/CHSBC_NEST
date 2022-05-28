import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { Expose, Transform, TransformFnParams } from 'class-transformer'

export class GetStudentResponseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @IsNumber()
  @ApiProperty({ required: true, example: 15 })
  groupId: number

  @IsNumber()
  @ApiProperty({ required: true, example: 10 })
  userId: number

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
