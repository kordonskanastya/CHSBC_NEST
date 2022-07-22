import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetLoggerStudentDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: GetGroupResponseDto })
  @Type(() => GetGroupResponseDto)
  group: GetGroupResponseDto

  @Expose()
  @ApiProperty({ type: GetUserResponseDto })
  @Type(() => GetUserResponseDto)
  user: GetUserResponseDto

  @Expose()
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  orderNumber: string

  @Expose()
  @ApiProperty({ type: String })
  edeboId: string

  @Expose()
  @ApiProperty({ type: Boolean })
  isFullTime: boolean
}
