import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Query,
  Put,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, PasswordDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Authorize, Permission } from 'src/common/decorators/common.decorator';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from './dto/user.dto';
import { ApiException } from 'src/common/exceptions/api.exception';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Post('register')
  @Authorize()
  async register(@Body() user: RegisterDto) {
    await this.userService.register(user);
  }

  @Post('login')
  @Authorize()
  async login(@Body() loginDto: LoginDto) {
    const vo = await this.userService.login(loginDto, false);
    vo.aceessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        userName: vo.userInfo.userName,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
    return vo;
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') token: string) {
    try {
      const data = this.jwtService.verify(token);

      const user = await this.userService.findUserInfoById(data.userId);
      const aceessToken = this.jwtService.sign(
        {
          userId: user.id,
          userName: user.userName,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refreshToken = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      return {
        aceessToken,
        refreshToken,
      };
    } catch (error) {
      throw new ApiException(11002);
    }
  }

  @Post('admin/login')
  @Authorize()
  async adminLogin(@Body() loginDto: LoginDto) {
    const vo = await this.userService.login(loginDto, true);
    vo.aceessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        userName: vo.userInfo.userName,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
    return vo;
  }

  @Get('admin/refresh')
  @Permission('aaa')
  async adminRefresh(@Query('refreshToken') token: string) {
    try {
      const data = this.jwtService.verify(token);

      const user = await this.userService.findUserInfoById(data.userId);
      const aceessToken = this.jwtService.sign(
        {
          userId: user.id,
          userName: user.userName,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refreshToken = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      return {
        aceessToken,
        refreshToken,
      };
    } catch (error) {
      throw new ApiException(11002);
    }
  }

  @Get('info')
  async info(@UserInfo('userId') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  @Put('updatePassword')
  async updatePassword(
    @Body() passwordDto: PasswordDto,
    @UserInfo('userId') userId: number,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Put('update')
  async updateInfo(
    @Body() userInfo: UpdateUserDto,
    @UserInfo('userId') userId: number,
  ) {
    return await this.userService.updateUser(userId, userInfo);
  }
}
