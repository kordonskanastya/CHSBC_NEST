import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsObject, IsString } from 'class-validator'
import { Expose } from 'class-transformer'
import { User } from '../../users/entities/user.entity'

export class GetGroupResponseDto {
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
  @ApiProperty({ type: User })
  curatorId: User

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
