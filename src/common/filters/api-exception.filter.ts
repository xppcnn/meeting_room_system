import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { ResponseDto } from '../contants/common.contant';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();
  catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const code =
      exception instanceof ApiException ? exception.getErrorCode() : status;
    let message = '服务器异常，请稍后再试';
    message =
      exception instanceof HttpException ? exception.message : `${exception}`;
    if (status >= 500) {
      this.logger.error(exception, ApiExceptionFilter.name);
    }
    const result = new ResponseDto(code, null, message);
    response.status(status).json(result);
  }
}
