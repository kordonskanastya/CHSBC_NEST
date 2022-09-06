import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'
import { GetGradeForIndividualPlanDto } from '../../grades/dto/get-grade-for-individual-plan.dto'

export class GetStudentIndividualPlanDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number

  @Expose()
  @ApiProperty({ type: GetUserDropdownResponseDto })
  @Type(() => GetUserDropdownResponseDto)
  user: GetUserDropdownResponseDto

  @Expose()
  @Type(() => GetGradeForIndividualPlanDto)
  @ApiProperty({ type: GetGradeForIndividualPlanDto })
  grades: GetGradeForIndividualPlanDto
}
