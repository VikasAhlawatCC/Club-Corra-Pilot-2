import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as { role?: string } | undefined
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  }
}


