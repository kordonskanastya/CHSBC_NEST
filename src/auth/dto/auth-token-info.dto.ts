import { IsNumber, IsString } from 'class-validator'
import { ROLE } from '../roles/role.enum'

export class AuthTokenInfoDto {
  constructor(user: any) {
    if (user) {
      this.sub = user['sub'] ?? null
      this.role = user['role'] ?? ROLE.STUDENT
    } else {
      this.sub = null
      this.role = ROLE.STUDENT
    }
  }

  @IsString()
  sub: string

  @IsNumber()
  role: string
}
