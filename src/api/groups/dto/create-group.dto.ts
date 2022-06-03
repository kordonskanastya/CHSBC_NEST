import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateGroupDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ required: true, example: '1П-21' })
  name: string

  @IsNumber()
  @ApiProperty({ required: true, example: 234 })
  curatorId: number

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({ required: true, example: 523512 })
  orderNumber: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiPropertyOptional({ required: true, example: 234 })
  deletedOrderNumber: string
}
