import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'
import { Expose } from 'class-transformer'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'

export class GetLoggerStudentDto {
  @Expose()
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @IsObject()
  @ApiProperty({ type: Object })
  groupId: Group

  @Expose()
  @IsObject()
  @ApiProperty({ type: Object })
  userId: User

  @Expose()
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  orderNumber: string

  @Expose()
  @IsString()
  @ApiProperty({ type: String })
  edeboId: string

  @Expose()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  isFullTime: boolean
}
