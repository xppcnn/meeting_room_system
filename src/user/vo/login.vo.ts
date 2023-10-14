import { ApiProperty } from '@nestjs/swagger';
import { Role, Permission } from '@prisma/client';

export interface UserInfo {
  id: number;

  userName: string;

  nickName: string;

  email: string;

  headPic: string;

  phoneNumber: string;

  isFrozen: boolean;

  isAdmin: boolean;

  roles: Role[];

  permissions: Permission[];
}

export class LoginVo {
  @ApiProperty()
  userInfo: UserInfo;

  @ApiProperty()
  aceessToken: string;

  @ApiProperty()
  refreshToken: string;
}
