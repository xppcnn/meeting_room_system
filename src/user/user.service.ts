import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}
@Injectable()
export class UserService {
  private logger = new Logger();

}
