import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class PasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Length(6, 30)
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: '请检查邮箱格式',
    },
  )
  email: string;

  @IsNotEmpty()
  captcha: string;
}
