import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { LoginRequestDto } from './dto/Login.request.dto';
import { AuthenticationService } from './authentication.service';
import { LoginResponseDto } from './dto/Login.response.dto';
import {
  AUTH_EXCEPTION_MSG,
  MEMBER_EXCEPTION_MSG,
} from '@src/infrastructure/exceptions';
import { Request } from 'express';
import { RefreshRequestDto } from './dto/Refresh.request.dto';
import { JwtGuard } from './jwt.guard';
import { join } from 'path';
import { SendEmailRequestDto } from './dto/SendEmail.request.dto';
import { CommonResponseDto } from '@src/infrastructure/common/common.response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('/login')
  @ApiOperation({ summary: '로그인을 진행합니다 Access Token을 발급합니다' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: [AUTH_EXCEPTION_MSG.InvalidMemberApproval].join(', '),
  })
  @ApiUnprocessableEntityResponse({
    description: AUTH_EXCEPTION_MSG.EmailYetConfirmed,
  })
  public async login(@Body() body: LoginRequestDto) {
    return await this.authService.login(body);
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh Token을 발급받습니다' })
  @ApiOkResponse({ type: RefreshRequestDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  @ApiUnauthorizedResponse({
    description: [
      AUTH_EXCEPTION_MSG.BearerTokenRequired,
      AUTH_EXCEPTION_MSG.TokenRequired,
      AUTH_EXCEPTION_MSG.RefreshTokenRequired,
      AUTH_EXCEPTION_MSG.RefreshTokenExpired,
      AUTH_EXCEPTION_MSG.IllegalTokenDetected,
    ].join(', '),
  })
  @ApiBearerAuth()
  public async refresh(@Req() req: Request): Promise<RefreshRequestDto> {
    return await this.authService.refresh(req);
  }

  @Get('/email')
  @ApiOperation({ summary: '이메일 인증을 확인합니다' })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiUnprocessableEntityResponse({
    description: AUTH_EXCEPTION_MSG.TokenNotFound,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_EXCEPTION_MSG.IllegalTokenDetected,
  })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async checkEmailCode(
    @Query('key') key: string,
  ): Promise<CommonResponseDto> {
    const result = await this.authService.checkEmailCode(key);
    return new CommonResponseDto(result);
  }

  @Post('/email')
  @ApiOperation({ summary: '이메일 인증을 전송합니다' })
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBadRequestResponse({
    description: MEMBER_EXCEPTION_MSG.MemberNotFound,
  })
  public async sendEmailCode(
    @Body() body: SendEmailRequestDto,
  ): Promise<CommonResponseDto> {
    const result = await this.authService.sendEmailCode(body);
    return new CommonResponseDto(result);
  }
}
