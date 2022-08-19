import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { CreateGroupResponseDto } from '../../groups/dto/create-group-response.dto'

export class GetStudentResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @Expose()
  @Type(() => CreateGroupResponseDto)
  @ApiProperty({ type: CreateGroupResponseDto })
  group: CreateGroupResponseDto

  @Expose()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  user: GetUserResponseDto

  @Expose()
  @ApiProperty({ required: true, example: '6724534082924' })
  orderNumber: string

  @Expose()
  @ApiProperty({ required: true, example: '12345678' })
  edeboId: string

  @Expose()
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
