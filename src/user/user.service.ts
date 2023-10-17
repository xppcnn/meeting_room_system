import { Injectable, Logger, Inject } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { md5 } from 'src/utils/utils';
import { LoginDto, PasswordDto } from './dto/login.dto';
import { LoginVo, UserDetailVo, UserInfo } from './vo/login.vo';
import { UpdateUserDto } from './dto/user.dto';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  async register(user: RegisterDto) {
    const captcha = await this.redisService.get(
      `register_captcha_${user.email}`,
    );
    if (!captcha) {
      throw new ApiException(10002);
    }

    if (captcha !== user.captcha) {
      throw new ApiException(10003);
    }

    const foundUser = await this.findUserByName(user.username);
    if (foundUser) {
      throw new ApiException(10001);
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
      throw new ApiException(10005);
    }

    if (user.password !== md5(data.password)) {
      throw new ApiException(10004);
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

  async findUserDetailById(userId: number): Promise<UserDetailVo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.userName = user.username;
    vo.nickName = user.nick_name;
    vo.phoneNumber = user.phone_number;
    vo.email = user.email;
    vo.isAdmin = user.is_admin;
    vo.isFrozen = user.is_frozen;
    vo.headPic = user.head_pic;
    return vo;
  }

  async updatePassword(userId: number, data: PasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${data.email}`,
    );
    if (!captcha) {
      throw new ApiException(10002);
    }

    if (captcha !== data.captcha) {
      throw new ApiException(10003);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    user.password = md5(data.password);

    try {
      await this.prisma.user.update({ data: user, where: { id: userId } });
    } catch (error) {
      this.logger.error(error, UserService);
    }
  }

  async updateUser(userId: number, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (data.headPic) {
      user.head_pic = data.headPic;
    }
    if (data.nickName) {
      user.nick_name = data.nickName;
    }
    if (data.phoneNumber) {
      user.phone_number = data.phoneNumber;
    }

    try {
      await this.prisma.user.update({ data: user, where: { id: userId } });
    } catch (error) {
      this.logger.error(error, UserService);
    }
  }
}
