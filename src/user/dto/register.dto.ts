import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({
    message: '用户名不可为空',
  })
  @Length(3, 20)
  username: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({
    message: '昵称不可为空',
  })
  nickName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Length(6, 30)
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail({}, { message: '邮箱格式不合法' })
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
