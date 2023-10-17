import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtUserData, UserKey } from 'src/types';

export const UserInfo = createParamDecorator(
  (
    data: UserKey,
    ctx: ExecutionContext,
  ): JwtUserData | JwtUserData[UserKey] | null => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  },
);
