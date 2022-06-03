import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'
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
  @ApiProperty({ type: GetGroupResponseDto })
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
