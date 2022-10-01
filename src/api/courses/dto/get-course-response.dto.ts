import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'

export class GetCourseResponseDto {
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
  @ApiProperty({ type: Number })
  lectureHours: number

  @Expose()
  @ApiProperty({ type: Boolean })
  isActive: boolean

  @Expose()
  @ApiProperty({ type: Number })
  semester: number

  @Expose()
  @ApiProperty({ type: String })
  type: string

  @Expose()
  @ApiProperty({ type: Boolean })
  isExam: boolean

  @Expose()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  teacher: GetUserResponseDto

  @Expose()
  @Type(() => GetGroupResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  groups: GetGroupResponseDto[]
}
