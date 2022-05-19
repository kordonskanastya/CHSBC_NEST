import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import * as faker from 'faker'

export class ForgotPasswordDto {
  @IsString()
  @ApiProperty({ uniqueItems: true, example: faker.internet.userName() })
  email: string
}
