import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthenticationService } from './authentication.service';
import jwtConfig from '@src/config/config/jwt.config';
import defaultConfig from '@src/config/config/default.config';
import { MemberModule } from '../member/member.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([MemberEntity]),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(defaultConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const issuer = config.get<string>('ISSUER', 'hoplin');
        return {
          global: true,
          secret: config.get<string>('TOKEN_SECRET', ''),
          verifyOptions: {
            issuer,
          },
          signOptions: {
            issuer,
          },
        };
      },
    }),
    RedisCacheModule,
    MemberModule,
    MailModule,
  ],
  providers: [JwtStrategy, AuthenticationService],
  controllers: [AuthController],
})
export class AuthModule {}
