// import {
//   CanActivate,
//   ExecutionContext,
//   Inject,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';
// import { Observable } from 'rxjs';

// @Injectable()
// export class LoginGuard implements CanActivate {
//   @Inject(JwtService)
//   private jwtService: JwtService;

//   @Inject(Reflector)
//   private reflector: Reflector;
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request: Request = context.switchToHttp().getRequest();
//     const requireLogin = this.reflector.getAllAndOverride('require-login', [
//       context.getClass(),
//       context.getHandler(),
//     ]);
//     if (!requireLogin) {
//       return true;
//     }
//     const authorization = request.header('authorization') || '';
//     const token = authorization.substring(7);
//     if (!token) {
//       throw new UnauthorizedException('token  错误');
//     }
//     try {
//       const info = this.jwtService.verify(token);
//       request.user = info.user;
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException('登录 token 失效，请重新登录');
//     }
//   }
// }
