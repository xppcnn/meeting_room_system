import { SetMetadata } from '@nestjs/common';
import {
  AUTHORIZE_KEY_METADATA,
  PERMISSION_KEY_METADATA,
} from '../contants/decorator.contant';

export const Authorize = () => SetMetadata(AUTHORIZE_KEY_METADATA, true);

export const Permission = (...perm: string[]) =>
  SetMetadata(PERMISSION_KEY_METADATA, perm);
