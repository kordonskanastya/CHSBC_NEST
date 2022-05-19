import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'

export class LoginUserDto {
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' && value !== '' ? value.trim() : null))
  @MinLength(3)
  @MaxLength(200)
  @ApiProperty({ uniqueItems: true, required: true, example: 'admin@gmail.com' })
  email: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(6, {
    message: 'The string must be greater than 6 characters. No spaces are allowed at the beginning or end of a line.',
  })
  @ApiProperty({ required: true, example: 'admin' })
  password: string
}
