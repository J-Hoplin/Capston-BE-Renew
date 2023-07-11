import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import swaggerGenerator from '@infrastructure/swagger/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { FlowInterceptor } from '@hoplin/nestjs-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global flow interceptor
  app.useGlobalInterceptors(new FlowInterceptor());

  // Global prefix. All API endpoints start with 'v1'
  app.setGlobalPrefix('v1');

  // Add Swagger Document
  SwaggerModule.setup('docs', app, swaggerGenerator(app));
  await app.listen(3000);
}
bootstrap();
