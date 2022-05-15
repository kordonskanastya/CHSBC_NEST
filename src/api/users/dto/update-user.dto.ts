import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean })
  status?: boolean

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  zone?: string
}
