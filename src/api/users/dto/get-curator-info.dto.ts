import { PartialType } from '@nestjs/swagger'
import { GetUserDropdownResponseDto } from './get-user-dropdown-response.dto'

export class GetCuratorInfoDto extends PartialType(GetUserDropdownResponseDto) {
  // @Expose()
  // @Type(() => GetGroupStudentsDto)
  // @ApiProperty({ type: GetGroupStudentsDto })
  // : GetGroupStudentsDto
}
