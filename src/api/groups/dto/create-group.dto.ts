import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateGroupDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty({ example: '1П-21' })
  name: string

  @IsNumber()
  @ApiProperty({ example: 3 })
  curatorId: number

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({ required: true, example: 123456 })
  orderNumber: string

  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6)
  @MaxLength(50)
  @ApiPropertyOptional({ required: false, example: 123456 })
  deletedOrderNumber?: string | null
}
