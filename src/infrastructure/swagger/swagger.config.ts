import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerTags } from '@infrastructure/swagger/swagger.tag';
import { INestApplication } from '@nestjs/common';
import { SwaggerTag } from '../types';

const documentConfig = new DocumentBuilder()
  .setTitle('API Document : Cloud education environment')
  .setDescription('Cloud education environment API document')
  .setVersion('1.0')
  .setContact('hoplin', 'https://github.com/J-hoplin1', 'jhoplin7259@gmail.com')
  .addBearerAuth();

swaggerTags.forEach(({ tag, description }: SwaggerTag) => {
  documentConfig.addTag(tag, description);
});

export default function generateSwaggerDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, documentConfig.build());
}
