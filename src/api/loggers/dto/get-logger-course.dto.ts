import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetLoggerCourseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @IsString()
  @ApiProperty({ type: Number })
  credits: number

  @Expose()
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ type: Number })
  lectureHours: number

  @Expose()
  @IsString()
  @ApiProperty({ type: Boolean })
  isActive: boolean

  @Expose()
  @IsString()
  @ApiProperty({ type: Number })
  semester: number

  @Expose()
  @IsBoolean()
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
