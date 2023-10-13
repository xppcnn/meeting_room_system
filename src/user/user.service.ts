import {
  Injectable,
  Logger,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { md5 } from 'src/utils/utils';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  async register(user: RegisterDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (captcha !== user.captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.findUserByName(user.username);
    if (foundUser) {
      throw new HttpException('用户名重复', HttpStatus.BAD_REQUEST);
    }

    const userVo: Prisma.UserCreateInput = {
      password: md5(user.password),
      nick_name: user.nickName,
      username: user.username,
      email: user.email,
    };
    try {
      await this.prisma.user.create({ data: userVo });
      return userVo;
    } catch (error) {}
  }

  async findUserByName(name: string): Promise<User> {
    return await this.prisma.user.findFirst({
      where: { username: name },
    });
  }
}
