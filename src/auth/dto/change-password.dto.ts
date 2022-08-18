import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { FAKE_EMAIL } from '../../constants'

export class ChangePasswordDto {
  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ uniqueItems: true, example: FAKE_EMAIL })
  email: string

  @IsString()
  @IsNotEmpty()
  // @Matches(
  //   /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
  //   { message: 'Weak password' },
  // )
  @ApiProperty({ type: String })
  readonly oldPassword: string

  @IsString()
  @IsNotEmpty()
  // @Matches(
  //   /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
  //   { message: 'Weak password' },
  // )
  @MinLength(8, {
    message: 'Пароль повинен бути бiльше 8 символiв',
  })
  @ApiProperty({ type: String })
  readonly newPassword: string
}
