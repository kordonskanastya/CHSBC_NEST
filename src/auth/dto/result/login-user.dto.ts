import { ApiProperty } from '@nestjs/swagger'
import { GetUserResponseDto } from '../../../api/users/dto/get-user-response.dto'
import { Expose } from 'class-transformer'

export class LoginUserResultDto extends GetUserResponseDto {
  @Expose()
  @ApiProperty({ type: String })
  accessToken: string

  @Expose()
  @ApiProperty({ type: String })
  refreshToken: string
}
