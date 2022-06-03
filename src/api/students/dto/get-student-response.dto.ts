import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetStudentResponseDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @Expose()
  @Type(() => GetGroupResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  group: GetGroupResponseDto

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
