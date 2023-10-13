import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/static' });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ApiTransformInterceptor(new Reflector()));
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
