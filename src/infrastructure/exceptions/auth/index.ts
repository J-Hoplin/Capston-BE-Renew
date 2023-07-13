import { UnauthorizedException } from '@nestjs/common';
export const AUTH_EXCEPTION_MSG = {
  PasswordUnmatched: 'Password unmatched',
};

export class PasswordUnmatched extends UnauthorizedException {
  constructor() {
    super(AUTH_EXCEPTION_MSG.PasswordUnmatched);
  }
}
