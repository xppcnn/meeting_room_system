import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PERMISSION_KEY_METADATA } from '../contants/decorator.contant';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 不需要登陆
    if (!request.user) {
      return true;
    }
    const permissions = request.user.permissions;
    const requirePermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY_METADATA,
      [context.getClass(), context.getHandler()],
    );
    if (!requirePermissions) {
      return true;
    }
    for (let i = 0; i < requirePermissions.length; i++) {
      const curPerm = requirePermissions[i];
      const found = permissions.find((item) => item.code === curPerm);
      if (!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }
    return true;
  }
}
