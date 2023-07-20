import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { DataSource } from 'typeorm';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '@src/config/config/jwt.config';
import defaultConfig from '@src/config/config/default.config';
import { JwtModule } from '@nestjs/jwt';
import { MemberModule } from '../member/member.module';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { configOptions } from '@src/options/config.option';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { typeORMConfig } from '@src/options/typeorm.option';
import {
  expiredJWT,
  mockRedisCacheService,
  mockedMailService,
  mockedMemberEntity,
  mockedMemberOriginalPassword,
  mockedMemberService,
} from './test';
import { MemberService } from '../member/member.service';
import { MailService } from '../mail/mail.service';
import { LoginRequestDto } from './dto/Login.request.dto';
import { LoginResponseDto } from './dto/Login.response.dto';
import {
  BearerTokenRequired,
  IllegalTokenDetected,
  InvalidMemberApproval,
  MemberNotFound,
  NotBearerToken,
  PasswordUnmatched,
  RefreshTokenExpired,
  RefreshTokenRequired,
} from '@src/infrastructure/exceptions';
import { member } from '@src/infrastructure/types';
import { Request } from 'express';
import { SendEmailRequestDto } from './dto/SendEmail.request.dto';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          applicationName: 'Authentication Service Test',
        }),
        ConfigModule.forRoot(configOptions),
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
      providers: [
        AuthenticationService,
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
        {
          provide: MemberService,
          useValue: mockedMemberService,
        },
        {
          provide: MailService,
          useValue: mockedMailService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  let exampleTokens: LoginResponseDto;
  describe('Login service test', () => {
    it('Should return JWT access token and refresh token', async () => {
      // Given
      const mockedUser: LoginRequestDto = {
        email: mockedMemberEntity.email,
        password: mockedMemberOriginalPassword,
      };
      // When
      exampleTokens = await service.login(mockedUser);
      const { accessToken, refreshToken } = exampleTokens;
      // Then
      expect(exampleTokens).toBeInstanceOf(LoginResponseDto);
      expect(accessToken).not.toBeUndefined();
      expect(refreshToken).not.toBeUndefined();
    });
  });

  it('Should return exception if member not exist', async () => {
    // Spy memberservice
    jest
      .spyOn(mockedMemberService, 'getMemberByEmail')
      .mockImplementationOnce(() => {
        // It raise member not found if not exist
        throw new MemberNotFound();
      });

    // Given
    const mockedUser: LoginRequestDto = {
      email: mockedMemberEntity.email,
      password: mockedMemberOriginalPassword,
    };
    // When
    try {
      await service.login(mockedUser);
    } catch (err) {
      // Then
      expect(err).toBeInstanceOf(MemberNotFound);
    }
  });

  it('Should return exception if fail to validate password', async () => {
    // Spy password validation function
    jest
      .spyOn(mockedMemberService, 'comparePassword')
      .mockImplementationOnce(() => false);

    // Given
    const mockedUser: LoginRequestDto = {
      email: mockedMemberEntity.email,
      password: mockedMemberOriginalPassword,
    };
    // When
    try {
      await service.login(mockedUser);
    } catch (err) {
      // Then
      expect(err).toBeInstanceOf(PasswordUnmatched);
    }
  });

  it('Should return exception if member has improper approval level to login', async () => {
    // Mock
    const unApprovedEntity = {
      ...mockedMemberEntity,
    };
    unApprovedEntity.approved = member.Approve.PENDING;
    jest
      .spyOn(mockedMemberService, 'getMemberByEmail')
      .mockImplementationOnce(() => unApprovedEntity);
    // Given
    const mockedUser: LoginRequestDto = {
      email: mockedMemberEntity.email,
      password: mockedMemberOriginalPassword,
    };
    // When
    try {
      await service.login(mockedUser);
    } catch (err) {
      // Then
      expect(err).toBeInstanceOf(InvalidMemberApproval);
    }
  });

  describe('Refresh service test', () => {
    it('Should return new access token', async () => {
      // mock cacheService.get as return refresh token
      // jest spyOn mockImplementation only able to return boolean type
      mockRedisCacheService.get = jest
        .fn()
        .mockReturnValueOnce(exampleTokens.refreshToken);

      // Gvien
      // Mocked Request Header
      const mockedRequest: Partial<Request> = {
        headers: {
          authorization: `Bearer ${exampleTokens.refreshToken}`,
        },
      };
      // When
      const result = await service.refresh(mockedRequest as Request);
      // Then
      const { accessToken } = result;
      expect(accessToken).not.toBeUndefined();
    });

    it('Should return BearerTokenRequired', async () => {
      // Gvien
      // Mocked Request Header
      const mockedRequest: Partial<Request> = {
        headers: {
          authorization: `${exampleTokens.refreshToken}`,
        },
      };
      // When
      try {
        await service.refresh(mockedRequest as Request);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(BearerTokenRequired);
      }
    });

    it('Should return RefreshTokenRequired', async () => {
      //Given
      // Give access token
      const mockedRequest: Partial<Request> = {
        headers: {
          authorization: `Bearer ${exampleTokens.accessToken}`,
        },
      };
      // When
      try {
        await service.refresh(mockedRequest as Request);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(RefreshTokenRequired);
      }
    });

    it('Should return IllegalTokenDetected', async () => {
      // mock cacheService.get as not return same refresh token
      mockRedisCacheService.get = jest.fn().mockReturnValueOnce('dummy datas');
      // Given
      const mockedRequest: Partial<Request> = {
        headers: {
          authorization: `Bearer ${exampleTokens.refreshToken}`,
        },
      };
      // When
      try {
        await service.refresh(mockedRequest as Request);
      } catch (err) {
        expect(err).toBeInstanceOf(IllegalTokenDetected);
      }
    });

    it('Should return RefreshTokenExpired', async () => {
      // Given
      const mockedRequest: Partial<Request> = {
        headers: {
          authorization: `Bearer ${expiredJWT}`,
        },
      };
      // When
      try {
        await service.refresh(mockedRequest as Request);
      } catch (err) {
        expect(err).toBeInstanceOf(RefreshTokenExpired);
      }
    });
  });

  describe('Send email code test', () => {
    it('Should send email', async () => {
      // Given
      const mockedRequest: SendEmailRequestDto = {
        id: 1,
      };
      // When
      const randomKey = await service.sendEmailCode(mockedRequest);
      // Then
      expect(randomKey).not.toBeUndefined();
    });
  });
});
