import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { RedisService } from 'src/redis/redis.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authorize } from 'src/common/decorators/common.decorator';

@Controller('email')
@ApiTags('email')
export class EmailController {
  @Inject(EmailService)
  private readonly emailService: EmailService;
  @Inject(RedisService)
  private readonly redisService: RedisService;

  @ApiQuery({
    name: 'address',
    type: String,
    required: true,
    description: '邮箱地址',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('code')
  @Authorize()
  async sendEmailCode(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `register_captcha_${address}`,
      '123456',
      5 * 60,
    );
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '登录验证码',
    //   html: '<p>你的登录验证码是 123456</p>',
    // });
    return 'success';
  }

  @ApiQuery({
    name: 'address',
    type: String,
    required: true,
    description: '邮箱地址',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('update_password/captcha')
  @Authorize()
  async sendUpdatePasswordCode(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      '123456',
      5 * 60,
    );
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '更改密码验证码',
    //   html: '<p>你的更改密码验证码是 123456</p>',
    // });
    return 'success';
  }

  @ApiQuery({
    name: 'address',
    type: String,
    required: true,
    description: '邮箱地址',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('reset_password/captcha')
  @Authorize()
  async sendResetPasswordCode(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `reset_password_captcha_${address}`,
      '123456',
      5 * 60,
    );
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '重置密码验证码',
    //   html: '<p>你的重置密码验证码是 123456</p>',
    // });
    return 'success';
  }
}
