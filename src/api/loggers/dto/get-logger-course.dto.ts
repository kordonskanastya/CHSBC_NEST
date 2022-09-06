import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetLoggerCourseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @ApiProperty({ type: Number })
  credits: number

  @Expose()
  @ApiPropertyOptional({ type: Number })
  lectureHours: number

  @Expose()
  @ApiProperty({ type: Boolean })
  isActive: boolean

  @Expose()
  @ApiProperty({ type: Number })
  semester: number

  @Expose()
  @ApiProperty({ type: Boolean })
  isCompulsory: boolean

  @Expose()
  @ApiProperty({ type: GetUserResponseDto })
  @Type(() => GetUserResponseDto)
  teacher: GetUserResponseDto

  @Expose()
  @ApiProperty({ type: GetGroupResponseDto })
  @Type(() => GetGroupResponseDto)
  groups: GetGroupResponseDto[]
}
