import { Controller, Get, Inject, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { RedisService } from 'src/redis/redis.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('email')
@ApiTags('email')
export class EmailController {
  @Inject(EmailService)
  private readonly emailService: EmailService;
  @Inject(RedisService)
  private readonly redisService: RedisService;
  @Get('code')
  async sendEmailCode(@Query('address') address) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, '123456', 5 * 60);
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '登录验证码',
    //   html: '<p>你的登录验证码是 123456</p>',
    // });
    return 'success';
  }
}
