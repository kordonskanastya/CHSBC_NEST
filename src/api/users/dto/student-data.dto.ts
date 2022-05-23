import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'
import * as faker from 'faker'
import { Transform, Type } from 'class-transformer'
import { TransformFnParams } from 'class-transformer/types/interfaces'

export class StudentData {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  dateOfBirth: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  group: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  orderNumber: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: faker.name.firstName() })
  edeboId: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({ required: true, example: true })
  isFullTime: boolean
}
