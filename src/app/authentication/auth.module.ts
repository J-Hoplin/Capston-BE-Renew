import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([MemberEntity]),
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
  ],
  providers: [JwtStrategy, AuthenticationService],
  controllers: [AuthController],
})
export class AuthModule {}
