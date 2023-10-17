import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { PostInterceptor } from './common/interceptors/post.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { InvokeRecordInterceptor } from './common/interceptors/invoke-record.interceptor';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/static' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException(
          errors
            .filter((item) => !!item.constraints)
            .flatMap((item) => Object.values(item.constraints))
            .join('; '),
        );
      },
    }),
  );
  app.useGlobalInterceptors(
    new ApiTransformInterceptor(new Reflector()),
    new PostInterceptor(),
    new InvokeRecordInterceptor(),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('meeting_room_system API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('test')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  await app.listen(configService.get('nest_server_port'));
}
bootstrap();
