import { Logger, Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { LoggerModule } from '@hoplin/nestjs-logger';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
