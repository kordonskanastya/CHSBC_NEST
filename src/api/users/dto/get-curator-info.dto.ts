import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetUserDropdownResponseDto } from './get-user-dropdown-response.dto'
import { Expose, Type } from 'class-transformer'
import { GetGroupStudentsDto } from '../../groups/dto/get-group-students.dto'

export class GetCuratorInfoDto extends PartialType(GetUserDropdownResponseDto) {
  @Expose()
  @Type(() => GetGroupStudentsDto)
  @ApiProperty({ type: GetGroupStudentsDto })
  groups: GetGroupStudentsDto
}
