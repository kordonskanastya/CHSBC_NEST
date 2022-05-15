import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  // @Matches(
  //   /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
  //   { message: 'Weak password' },
  // )
  @ApiProperty({ type: String })
  readonly password: string
}
