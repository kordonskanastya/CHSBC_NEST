import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'
import { CreateUserDto } from '../../api/users/dto/create-user.dto'

export class RegisterDto extends CreateUserDto {
  @IsString()
  @MinLength(6, {
    message: 'The string must be greater than 6 characters. No spaces are allowed at the beginning or end of a line.',
  })
  @ApiPropertyOptional({ example: 'c4hG3ybg$jTc' })
  password: string
}
