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
import { LoginDto } from './dto/login.dto';
import { LoginVo, UserInfo } from './vo/login.vo';

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

  async login(data: LoginDto, isAdmin: boolean) {
    const user = await this.prisma.user.findFirst({
      where: { username: data.username, is_admin: isAdmin },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    if (!user) {
      throw new HttpException('该用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(data.password)) {
      throw new HttpException('该用户不存在', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginVo();
    vo.userInfo = {
      userName: user.username,
      nickName: user.nick_name,
      id: user.id,
      email: user.email,
      headPic: user.head_pic,
      phoneNumber: user.phone_number,
      isFrozen: user.is_frozen,
      isAdmin: user.is_admin,
      roles: user.roles.map((item) => ({ name: item.name, id: item.id })),
      permissions: user.roles.reduce((prev, cur) => {
        cur.permissions.forEach((permission) => {
          if (prev.indexOf(permission) === -1) {
            prev.push(permission);
          }
        });
        return prev;
      }, []),
    };
    return vo;
  }

  async findUserByName(name: string): Promise<User> {
    return await this.prisma.user.findFirst({
      where: { username: name },
    });
  }
  async findUserInfoById(userId: number): Promise<UserInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    const vo: UserInfo = {
      userName: user.username,
      nickName: user.nick_name,
      id: user.id,
      email: user.email,
      headPic: user.head_pic,
      phoneNumber: user.phone_number,
      isFrozen: user.is_frozen,
      isAdmin: user.is_admin,
      roles: user.roles.map((item) => ({ name: item.name, id: item.id })),
      permissions: user.roles.reduce((prev, cur) => {
        cur.permissions.forEach((permission) => {
          if (prev.indexOf(permission) === -1) {
            prev.push(permission);
          }
        });
        return prev;
      }, []),
    };
    return vo;
  }
}
