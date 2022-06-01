import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsObject, IsString, MaxLength, MinLength } from 'class-validator'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'
import { GetGroupResponseDto } from '../../groups/dto/get-group-response.dto'

export class GetStudentResponseDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '15.03.2002' })
  dateOfBirth: string

  @Expose()
  @IsObject()
  @Type(() => GetGroupResponseDto)
  @ApiProperty({ type: GetGroupResponseDto })
  groupId: GetGroupResponseDto

  @Expose()
  @IsObject()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  userId: GetUserResponseDto

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '6724534082924' })
  orderNumber: string

  @IsString()
  @MinLength(8)
  @MaxLength(8)
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @ApiProperty({ required: true, example: '12345678' })
  edeboId: string

  @IsBoolean()
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
