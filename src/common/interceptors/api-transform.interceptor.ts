import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRANSFORM_KEEP_KEY_METADATA } from '../contants/decorator.contant';
export class ApiTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        const keep = this.reflector.getAllAndOverride<boolean>(
          TRANSFORM_KEEP_KEY_METADATA,
          [context.getClass(), context.getHandler()],
        );
        if (keep) {
          return result;
        } else {
          return {
            code: 200,
            message: '请求成功!',
            data: result ?? null,
          };
        }
      }),
    );
  }
}
