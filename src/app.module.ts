import { Logger, Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from './options/config.option';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './options/typeorm.option';

@Module({
  imports: [
    LoggerModule.forRoot({
      applicationName: 'Cloud Education BE API',
      saveAsFile: true,
      logfileDirectory: `${__dirname}/../`,
      levelNTimestamp: {
        logLevels: ['verbose'],
        timestamp: true,
      },
    }),
    ConfigModule.forRoot(configOptions),
    TypeOrmModule.forRootAsync(typeORMConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
