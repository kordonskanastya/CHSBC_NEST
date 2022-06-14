import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsObject, IsString } from 'class-validator'
import { Expose, Type } from 'class-transformer'
import { GetUserResponseDto } from '../../users/dto/get-user-response.dto'

export class GetLoggerGroupDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @IsObject()
  @Type(() => GetUserResponseDto)
  @ApiProperty({ type: GetUserResponseDto })
  curatorId: GetUserResponseDto

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  orderNumber: string

  @Expose()
  @IsDate()
  @ApiProperty({ type: Date })
  updated: Date

  @Expose()
  @IsDate()
  @ApiProperty({ type: Date })
  created: Date
}
