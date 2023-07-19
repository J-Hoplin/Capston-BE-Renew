import { UnauthorizedException } from '@nestjs/common';
export const AUTH_EXCEPTION_MSG = {
  PasswordUnmatched: 'PASSWORD_UNMATCHED',
  AccessTokenRequired: 'ACCESS_TOKEN_REQUIRED',
};

export class PasswordUnmatched extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.PasswordUnmatched);
  }
}

export class AccessTokenRequired extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.AccessTokenRequired);
  }
}
