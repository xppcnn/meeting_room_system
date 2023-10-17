import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AUTHORIZE_KEY_METADATA } from '../contants/decorator.contant';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const [classAuth, handlerAuth] = this.reflector.getAll<[boolean, boolean]>(
      AUTHORIZE_KEY_METADATA,
      [context.getClass(), context.getHandler()],
    );
    // 以handler上注解优先
    if (handlerAuth || classAuth) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new ApiException(11004);
    }
    try {
      const token = authorization.slice(7);
      const info = this.jwtService.verify(token);
      request.user = {
        userId: info.userId,
        username: info.username,
        roles: info.roles,
        permissions: info.permissions,
      };
      return true;
    } catch (error) {
      throw new ApiException(11002);
    }
  }
}
