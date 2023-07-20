import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoggerModule } from '@hoplin/nestjs-logger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { AuthenticationService } from './authentication.service';
import { LoginRequestDto } from './dto/Login.request.dto';
import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { SendEmailRequestDto } from './dto/SendEmail.request.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            validateRefreshToken: jest.fn(),
            getRefreshTokenKeyPreset: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            checkEmailCode: jest.fn(),
            sendEmailCode: jest.fn(),
          },
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  describe('Login Controller', () => {
    it("Should call it's service once", async () => {
      const spy = jest.spyOn(service, 'login');
      //Given
      const mockDto: LoginRequestDto = {
        email: 'jhoplin7259@gmail.com',
        password: 'password',
      };
      // When
      await service.login(mockDto);
      // Then
      expect(spy).toBeCalledTimes(1);
    });

    it('Should return exception for wrong type of dto field', async () => {
      const spy = jest.spyOn(service, 'login');
      // Given
      //Given

      // Wront type of email format
      const mockDto: LoginRequestDto = {
        email: 'jhoplin',
        password: 'password',
      };

      // When
      try {
        await service.login(mockDto);
      } catch (err) {
        // Then
        expect(err).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('Refresh Controller', () => {
    it("Should call it's service once", async () => {
      const spy = jest.spyOn(service, 'refresh');

      // Given
      const mockRequest = {};

      // When
      await service.refresh(mockRequest as Request);
      // Then
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('GET - checkEmailCode Controller', () => {
    it("Should call it's service once", async () => {
      const spy = jest.spyOn(service, 'checkEmailCode');
      // Given
      const mockKey = 'test';

      // When
      await service.checkEmailCode(mockKey);

      // Then
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('POST - sendEmailCode controller', () => {
    it("Should call it's service once", async () => {
      const spy = jest.spyOn(service, 'sendEmailCode');
      // Given
      const mockDto: SendEmailRequestDto = {
        id: 1,
      };
      // When
      await service.sendEmailCode(mockDto);

      // Then
      expect(spy).toBeCalledTimes(1);
    });

    it('Should return HTTP Exception', async () => {
      const spy = jest.spyOn(service, 'sendEmailCode');
      // Given
      const mockDto = {};
      // When
      try {
        await service.sendEmailCode(mockDto as SendEmailRequestDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
      }
    });
  });
});
