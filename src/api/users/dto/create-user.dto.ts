import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { ROLE } from '../../../auth/roles/role.enum'
import { RegisterDto } from '../../../auth/dto/register.dto'

export class CreateUserDto extends RegisterDto {
  @IsEnum(ROLE)
  @ApiProperty({ default: ROLE.STUDENT, enum: ROLE })
  role: ROLE
}
