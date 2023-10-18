import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Query,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDto, PasswordDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Authorize, Pagination } from 'src/common/decorators/common.decorator';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from './dto/user.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import {
  PaginatedResponseDto,
  PaginationParams,
} from 'src/common/contants/common.contant';
import { UserDetailVo } from './vo/user.vo';
import { LoginVo, RefreshTokenVo } from './vo/login.vo';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: String })
  @Post('register')
  @Authorize()
  async register(@Body() user: RegisterDto): Promise<string> {
    return await this.userService.register(user);
  }

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginVo })
  @Post('login')
  @Authorize()
  async login(@Body() loginDto: LoginDto): Promise<LoginVo> {
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

  @ApiQuery({
    name: 'refreshToken',
    type: String,
  })
  @ApiOkResponse({ type: RefreshTokenVo })
  @Get('refresh')
  async refresh(@Query('refreshToken') token: string): Promise<RefreshTokenVo> {
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

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginVo })
  @Post('admin/login')
  @Authorize()
  async adminLogin(@Body() loginDto: LoginDto): Promise<LoginVo> {
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

  @ApiQuery({
    name: 'refreshToken',
    type: String,
  })
  @ApiOkResponse({ type: RefreshTokenVo })
  @Get('admin/refresh')
  async adminRefresh(
    @Query('refreshToken') token: string,
  ): Promise<RefreshTokenVo> {
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

  @ApiOkResponse({ type: UserDetailVo })
  @Get('info')
  async info(@UserInfo('userId') userId: number): Promise<UserDetailVo> {
    return await this.userService.findUserDetailById(userId);
  }

  @ApiBody({ type: PasswordDto })
  @ApiOkResponse({ type: String })
  @Put('updatePassword')
  async updatePassword(
    @Body() passwordDto: PasswordDto,
    @UserInfo('userId') userId: number,
  ): Promise<string> {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: null })
  @Put('update')
  async updateInfo(
    @Body() userInfo: UpdateUserDto,
    @UserInfo('userId') userId: number,
  ): Promise<null> {
    return await this.userService.updateUser(userId, userInfo);
  }

  @ApiQuery({
    name: 'id',
    type: Number,
    description: 'userId',
  })
  @ApiOkResponse({ type: null })
  @Get('freeze')
  async freeze(@Query('id', ParseIntPipe) userId: number): Promise<null> {
    return await this.userService.freezeUser(userId);
  }

  @ApiQuery({
    name: 'pageNum',
    type: Number,
    required: true,
    description: '页码',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: true,
    description: '分页大小',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'nickName',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
  })
  @ApiOkResponse({ type: [UserDetailVo] })
  @Get('list')
  async list(
    @Pagination() parmas: PaginationParams,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ): Promise<PaginatedResponseDto<UserDetailVo>> {
    const page = await this.userService.findUserList(
      parmas.pageNum,
      parmas.pageSize,
      nickName,
      username,
      email,
    );
    return {
      ...page,
      ...parmas,
    };
  }
}
