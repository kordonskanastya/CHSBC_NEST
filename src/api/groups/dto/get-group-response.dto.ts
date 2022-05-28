import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsString } from 'class-validator'
import { Expose } from 'class-transformer'

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
  @IsNumber()
  @ApiProperty({ type: Number })
  curatorId: number

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
