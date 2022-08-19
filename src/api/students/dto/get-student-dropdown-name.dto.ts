import { Expose, Type } from 'class-transformer'
import { GetUserDropdownResponseDto } from '../../users/dto/get-user-dropdown-response.dto'

export class GetStudentDropdownNameDto {
  @Expose()
  id: number
  @Expose()
  @Type(() => GetUserDropdownResponseDto)
  user: GetUserDropdownResponseDto
}
