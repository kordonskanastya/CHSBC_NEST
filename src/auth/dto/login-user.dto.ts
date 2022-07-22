import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'

export class LoginUserDto {
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @Matches(/^[^\s]+$/, { message: "You can't use spaces within a string" })
  @MinLength(3)
  @MaxLength(200)
  @ApiProperty({ uniqueItems: true, required: true, example: 'admin@gmail.com' })
  email: string

  @IsString()
  @MinLength(8, {
    message: 'The string must be greater than 8 characters. No spaces are allowed at the beginning or end of a line.',
  })
  @ApiProperty({ required: true, example: 'admin@gmail.com' })
  password: string
}
