import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { TokenRefreshDto } from './dto/token-refresh.dto'
import { USER_REPOSITORY } from '../constants'
import { Repository } from 'typeorm'
import { User } from '../api/users/entities/user.entity'

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    @Inject(USER_REPOSITORY)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { sub, refresh }: TokenRefreshDto = request?.user

    if (refresh) {
      const user = await this.usersRepository.findOne({ id: +sub })

      if (user && user.refreshTokenList) {
        const requestToken = request.headers.authorization.replace(/^Bearer /, '')

        if (user?.refreshTokenList.find(({ token }) => token === requestToken)) {
          return true
        }
      }
    }

    return false
  }
}
