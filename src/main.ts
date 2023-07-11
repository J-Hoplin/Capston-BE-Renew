import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import swaggerGenerator from '@infrastructure/swagger/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { FlowInterceptor} from "@hoplin/nestjs-logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new FlowInterceptor());
  app.setGlobalPrefix('v1');
  SwaggerModule.setup('docs', app, swaggerGenerator(app));
  await app.listen(3000);
}
bootstrap();
