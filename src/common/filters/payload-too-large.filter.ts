import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../contants/common.contant';
import { ErrorCodeMap } from '../contants/error-code.contant';

@Catch(PayloadTooLargeException)
export class PayloadTooLargeFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    const code = 20005;
    const result = new ResponseDto(code, null, ErrorCodeMap[code]);
    response.status(HttpStatus.BAD_REQUEST).json(result);
  }
}
