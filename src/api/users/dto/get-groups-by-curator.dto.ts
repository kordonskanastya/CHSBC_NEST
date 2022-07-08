import { ApiProperty, PartialType } from '@nestjs/swagger'
import { GetUserResponseDto } from './get-user-response.dto'
import { Expose, Type } from 'class-transformer'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'

export class GetGroupsByCuratorDto extends PartialType(GetUserResponseDto) {
  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  groups: CreateGroupResponseDto
}
