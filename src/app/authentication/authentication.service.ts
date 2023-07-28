import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { Repository } from 'typeorm';
import { LoginRequestDto } from './dto/Login.request.dto';
import { LoginResponseDto } from './dto/Login.response.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '@src/config/config/jwt.config';
import defaultConfig from '@src/config/config/default.config';
import * as bcrypt from 'bcryptjs';
import {
  BearerTokenRequired,
  EmailYetConfirmed,
  IllegalTokenDetected,
  InvalidMemberApproval,
  MemberNotFound,
  NotBearerToken,
  PasswordUnmatched,
  RefreshTokenExpired,
  RefreshTokenRequired,
  TokenNotFound,
  TokenRequired,
} from '@src/infrastructure/exceptions';
import { MemberService } from '../member/member.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@hoplin/nestjs-logger';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { Request } from 'express';
import { RefreshRequestDto } from './dto/Refresh.request.dto';
import {
  JwtDecodedPayload,
  JwtSubjectType,
} from '@src/infrastructure/types/jwt';
import { MailService } from '../mail/mail.service';
import { member } from '@src/infrastructure/types';
import { SendEmailRequestDto } from './dto/SendEmail.request.dto';
import { v4 } from 'uuid';
import { emailVerificationHTML } from './mail/email-verification.html';

@Injectable()
export class AuthenticationService {
  private emailConfirmSubject = 'EMAIL_CONFIRM';
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: RedisCacheService,
    private readonly memberService: MemberService,
    private readonly mailService: MailService,
    private readonly logger: Logger,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
    @Inject(defaultConfig.KEY)
    private readonly defaultConf: ConfigType<typeof defaultConfig>,
  ) {}

  public async validateRefreshToken(
    authorizaitonHeader: string,
  ): Promise<[string, MemberEntity]> {
    let token: string;
    try {
      // Extract bearer token
      const [format, bearerToken] = authorizaitonHeader.split(' ');
      if (format !== 'Bearer') {
        throw new NotBearerToken();
      }
      token = bearerToken;
    } catch (err) {
      throw new BearerTokenRequired();
    }

    if (!token) {
      throw new TokenRequired();
    }
    // Decode
    const payload = <JwtDecodedPayload>this.jwtService.decode(token);
    if (payload.sub !== JwtSubjectType.REFRESH) {
      throw new RefreshTokenRequired();
    }

    const user = await this.memberService.getMemberById(payload.user_id);
    return [token, user];
  }

  // Redis Key present generator for refresh token
  public getRefreshTokenKeyPreset(member: MemberEntity): string {
    return `${member.id}_${member.email}`;
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponseDto> {
    const findMember = await this.memberService.getMemberByEmail(email);
    const validatePassword = await this.memberService.comparePassword(
      password,
      findMember.password,
    );
    if (!validatePassword) {
      throw new PasswordUnmatched();
    }

    // If user's approval level improper
    if (
      [
        member.Approve.PENDING,
        member.Approve.REJECT,
        member.Approve.RESTRICT,
      ].includes(findMember.approved)
    ) {
      throw new InvalidMemberApproval();
    }

    // If user yet confirm email
    if (!findMember.emailConfirmed) {
      throw new EmailYetConfirmed();
    }

    // Generate access, refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(findMember.id),
      this.generateRefreshToken(findMember.id),
    ]);

    // Refresh token TTL : 1 Week
    // Enroll refresh token
    await this.cacheService.set(
      this.getRefreshTokenKeyPreset(findMember),
      refreshToken,
      1000 * 60 * 60 * 24 * 7,
    );

    this.logger.log(`${findMember.name}(${findMember.groupId}) logged in!`);
    return new LoginResponseDto({
      accessToken,
      refreshToken,
    });
  }

  public async refresh(req: Request): Promise<RefreshRequestDto> {
    // Validate authorization token and get member entity
    const [token, member] = await this.validateRefreshToken(
      req.headers.authorization,
    );
    // Ger refresh token from redis
    const refreshToken = await this.cacheService.get(
      this.getRefreshTokenKeyPreset(member),
    );

    // If refresh token doesn't exist, it mean refresh token expired
    if (!refreshToken) {
      throw new RefreshTokenExpired();
    }

    // If user's refresh token and token from redis different
    if (refreshToken !== token) {
      throw new IllegalTokenDetected();
    }

    this.logger.log(`${member.name}(${member.groupId}) refresh access token!`);
    return new RefreshRequestDto({
      accessToken: await this.generateAccessToken(member.id),
    });
  }

  public async checkEmailCode(key: string) {
    const findCode = await this.cacheService.get(key);
    if (!findCode) {
      throw new TokenNotFound();
    }
    try {
      // Verify secret and subject. Secret configed in JWTModule
      const member = <JwtDecodedPayload>await this.jwtService.verifyAsync(
        findCode,
        {
          subject: this.jwtConf.emailConfirm.subject,
        },
      );

      // Find member based on payload
      const findMember = await this.memberService.getMemberById(member.user_id);
      findMember.emailConfirmed = true;
      await this.memberService.save(findMember);

      // Delete key-value from redis
      await this.cacheService.del(key);
      return true;
    } catch (err) {
      // If unable to verify Token
      throw new IllegalTokenDetected();
    }
  }

  public async sendEmailCode(body: SendEmailRequestDto): Promise<string> {
    const subject = 'New member email authentication';
    const { id } = body;
    // Check member with id exist
    const member = await this.memberService.getMemberById(id);

    // Generate
    const token = await this.generateEmailConfirmToken(id);
    // Generate random uuid key for temporary key
    const randomKey = v4();

    // Email Confirm Code TTL  : 1day
    await this.cacheService.set(randomKey, token, 1000 * 60 * 60 * 24);
    const validationURL = `${this.defaultConf.gateWay}/v1/auth/send?key=${randomKey}`;
    this.mailService
      .sendMail(member.email, subject, emailVerificationHTML(validationURL))
      .then(() => {
        this.logger.log(`Success to send mail : ${member.email}`);
      });
    return randomKey;
  }

  public async logout(member: MemberEntity) {
    const key = this.getRefreshTokenKeyPreset(member);
    await this.cacheService.del(key);
    return true;
  }

  // For Email Confirm
  private async generateEmailConfirmToken(user_id: number): Promise<string> {
    return this.jwtService.signAsync(
      {
        user_id,
      },
      {
        subject: this.jwtConf.emailConfirm.subject,
      },
    );
  }

  // For access token
  private async generateAccessToken(user_id: number): Promise<string> {
    return this.jwtService.signAsync(
      {
        user_id,
      },
      {
        expiresIn: this.jwtConf.accessToken.expire,
        subject: this.jwtConf.accessToken.subject,
      },
    );
  }

  // For refresh token
  private async generateRefreshToken(user_id: number): Promise<string> {
    return this.jwtService.signAsync(
      {
        user_id,
      },
      {
        expiresIn: this.jwtConf.refreshToken.expire,
        subject: this.jwtConf.refreshToken.subject,
      },
    );
  }
}
