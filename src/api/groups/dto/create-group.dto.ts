import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../users/entities/user.entity'

export class CreateGroupDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ required: true, example: '1П-21' })
  name: string

  @IsNumber()
  @ApiProperty({ required: true, example: 234 })
  curatorId: User

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({ required: true, example: 523512 })
  orderNumber: string
}
