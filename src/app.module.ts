import { Logger, Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from './options/config.option';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './options/typeorm.option';
import { HealthModule } from './app/health/health.module';
import { MemberModule } from './app/member/member.module';
import { AuthModule } from './app/authentication/auth.module';
import { MailModule } from './app/mail/mail.module';
import { DepartmentModule } from './app/department/department.module';
import { ClassImageModule } from './app/class-image/class-image.module';
import { InstructorModule } from './app/instructor/instructor.module';
import { ClassModule } from './app/class/class.module';
import { StudentModule } from './app/student/student.module';

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
    HealthModule,
    MemberModule,
    AuthModule,
    MailModule,
    DepartmentModule,
    ClassImageModule,
    InstructorModule,
    ClassModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
