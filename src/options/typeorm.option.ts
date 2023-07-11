import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    return {
      type: 'mysql',
      host: configService.get<string>('DATABASE_HOST'),
      port: +configService.get<string>('DATABASE_PORT'),
      username: configService.get<string>('DATABASE_USER'),
      password: configService.get<string>('DATABASE_PASSWORD'),
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      database: configService.get<string>('DATABASE_DEFAULT'),
      synchronize: configService.get<string>('API_MODE') === 'dev',
    };
  },
  inject: [ConfigService],
};
