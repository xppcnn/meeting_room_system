import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';

/**
 * 将post默认的201 状态码替换成 200
 */
export class PostInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    if (request.method === 'POST') {
      if (response.statusCode === 201) {
        response.status(HttpStatus.OK);
      }
    }
    return next.handle();
  }
}
