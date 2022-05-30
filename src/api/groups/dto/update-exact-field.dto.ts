import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateExactFieldDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ required: false, example: '1П-21' })
  name?: string

  @IsNumber()
  @ApiProperty({ required: false, example: 234 })
  curatorId?: number

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({ required: false, example: 523512 })
  orderNumber?: string

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({ required: false, example: 523512 })
  deletedOrderNumber?: string
}
