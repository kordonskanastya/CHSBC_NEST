import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateGroupDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(1, { message: 'Назва групи  має містити 1 та більше символи' })
  @MaxLength(30, { message: 'Назва групи може містити максимум 30 символів' })
  @ApiProperty({ example: '1П-21' })
  name: string

  @IsNumber()
  @ApiProperty({ example: 3 })
  curatorId: number

  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6, { message: 'Номер наказу  має містити 6 та більше символів' })
  @MaxLength(30, { message: 'Номер наказу може містити максимум 30 символів' })
  @ApiProperty({ required: true, example: 123456 })
  orderNumber: string

  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.toString().trim())
  @MinLength(6, { message: 'Номер наказу на видалення  має містити 6 та більше символів' })
  @MaxLength(30, { message: 'Номер наказу на видалення може містити максимум 30 символів' })
  @ApiPropertyOptional({ required: false, example: 123456 })
  deletedOrderNumber?: string | null
}
