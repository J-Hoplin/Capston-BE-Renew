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

  describe("Should call it's service once", () => {
    it('login', async () => {
      const spy = jest.spyOn(service, 'login');
      //Given
      const mockDto: LoginRequestDto = {
        email: 'jhoplin7259@gmail.com',
        password: 'password',
      };
      // When
      await controller.login(mockDto);
      // Then
      expect(spy).toBeCalledTimes(1);
    });

    it('refresh', async () => {
      const spy = jest.spyOn(service, 'refresh');
      // When
      await controller.refresh({} as Request);
      expect(spy).toBeCalledTimes(1);
    });

    it('check email', async () => {
      const spy = jest.spyOn(service, 'checkEmailCode');
      await controller.checkEmailCode('test');
      expect(spy).toBeCalledTimes(1);
    });

    it('send email', async () => {
      const spy = jest.spyOn(service, 'sendEmailCode');
      await controller.sendEmailCode({} as SendEmailRequestDto);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
