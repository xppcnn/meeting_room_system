import {
  ExecutionContext,
  SetMetadata,
  ParseIntPipe,
  createParamDecorator,
  Paramtype,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AUTHORIZE_KEY_METADATA,
  PERMISSION_KEY_METADATA,
} from '../contants/decorator.contant';
import { PaginationParams } from '../contants/common.contant';
import { ApiException } from '../exceptions/api.exception';

export const Authorize = () => SetMetadata(AUTHORIZE_KEY_METADATA, true);

export const Permission = (...perm: string[]) =>
  SetMetadata(PERMISSION_KEY_METADATA, perm);

export const Pagination = createParamDecorator(
  async (
    type: Paramtype = 'query',
    ctx: ExecutionContext,
  ): Promise<PaginationParams> => {
    const request: Request = ctx.switchToHttp().getRequest();
    const pageNum = await new ParseIntPipe({
      exceptionFactory() {
        throw new ApiException(10000);
      },
    }).transform((request[type].pageNum as string) ?? '1', {
      type,
    });
    const pageSize = await new ParseIntPipe({
      exceptionFactory() {
        throw new ApiException(10000);
      },
    }).transform((request[type].pageSize as string) ?? '10', {
      type,
    });
    return {
      pageNum,
      pageSize,
    };
  },
);
