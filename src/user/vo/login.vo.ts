import { ApiProperty } from '@nestjs/swagger';
import { Role, Permission } from '@prisma/client';

export class UserInfo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: boolean;
  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  roles: Role[];

  @ApiProperty()
  permissions: Permission[];
}

export class RefreshTokenVo {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
export class LoginVo extends RefreshTokenVo {
  @ApiProperty()
  userInfo: UserInfo;
}
