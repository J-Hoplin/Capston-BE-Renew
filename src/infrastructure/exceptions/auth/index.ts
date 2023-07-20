import {
  BadRequestException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
export const AUTH_EXCEPTION_MSG = {
  PasswordUnmatched: 'PASSWORD_UNMATCHED',
  TokenRequired: 'TOKEN_REQUIRED',
  BearerTokenRequired: 'BEARER_TOKEN_REQUIRED',
  AccessTokenRequired: 'ACCESS_TOKEN_REQUIRED',
  RefreshTokenRequired: 'REFRESH_TOKEN_REQUIRED',
  RefreshTokenExpired: 'REFRESH_TOKEN_EXPIRED',
  IllegalTokenDetected: 'ILLEGAL_TOKEN_DETECTED',
  InvalidMemberApproval: 'INVALID_MEMBER_APPROVAL',
  EmailYetConfirmed: 'EMAIL_YET_CONFIRMED',
  TokenNotFound: 'TOKEN_NOT_FOUND',
  NotBearerToken: 'NOT_BEARER_TOKEN',
};

export class PasswordUnmatched extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.PasswordUnmatched);
  }
}

export class BearerTokenRequired extends BadRequestException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.BearerTokenRequired);
  }
}

export class TokenRequired extends BadRequestException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.TokenRequired);
  }
}

export class AccessTokenRequired extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.AccessTokenRequired);
  }
}

export class RefreshTokenRequired extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.RefreshTokenRequired);
  }
}
export class RefreshTokenExpired extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.RefreshTokenExpired);
  }
}

export class IllegalTokenDetected extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.IllegalTokenDetected);
  }
}

export class InvalidMemberApproval extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.InvalidMemberApproval);
  }
}

export class EmailYetConfirmed extends UnprocessableEntityException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.EmailYetConfirmed);
  }
}

export class TokenNotFound extends UnprocessableEntityException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.TokenNotFound);
  }
}

export class NotBearerToken extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.NotBearerToken);
  }
}
