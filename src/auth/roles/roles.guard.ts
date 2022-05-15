import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { isRoleEnough } from './role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minRoleController = this.reflector.get<string>('minRole', context.getClass())
    let minRoleMethod = this.reflector.get<string>('minRole', context.getHandler())

    if (!minRoleMethod && minRoleController) minRoleMethod = minRoleController

    if (!minRoleMethod) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    return isRoleEnough(request?.user?.role, minRoleMethod)
  }
}
