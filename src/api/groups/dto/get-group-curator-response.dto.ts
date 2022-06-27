import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetGroupCuratorResponseDto {
  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  @ApiProperty({ type: GetUserDropdownResponseDto })
  curator: GetUserDropdownResponseDto
}
