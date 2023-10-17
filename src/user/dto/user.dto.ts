import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  nickName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  headPic: string;
}
