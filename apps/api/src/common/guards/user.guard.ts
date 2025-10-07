import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as { type?: string; role?: string } | undefined
    if (!user) return false
    return user.type === 'user' || user.role === 'user'
  }
}
