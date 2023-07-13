import { BadRequestException } from '@nestjs/common';

export const MEMBER_EXCEPTION_MSG = {
  MemberNotFound: 'Member not found',
};

export class MemberNotFound extends BadRequestException {
  constructor(msg?: string) {
    super(msg ? msg : MEMBER_EXCEPTION_MSG.MemberNotFound);
  }
}
