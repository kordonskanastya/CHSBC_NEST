import { IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateIndividualPlanDto {
  @IsArray()
  @ApiProperty({ example: [1, 2] })
  courses: number[]
}
