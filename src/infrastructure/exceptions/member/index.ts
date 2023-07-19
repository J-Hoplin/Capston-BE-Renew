import { BadRequestException } from '@nestjs/common';

export const MEMBER_EXCEPTION_MSG = {
  MemberNotFound: 'MEMBER_NOT_FOUND',
  GroupIDAlreadyTaken: 'GROUP_ID_ALREADY_TAKEN',
  EmailAlreadyTaken: 'EMAIL_ALREADY_TAKEN',
};

export class MemberNotFound extends BadRequestException {
  constructor() {
    super(MEMBER_EXCEPTION_MSG.MemberNotFound);
  }
}

export class GroupIDAlreadyTaken extends BadRequestException {
  constructor() {
    super(`${MEMBER_EXCEPTION_MSG.GroupIDAlreadyTaken}`);
  }
}

export class EmailAlreadyTaken extends BadRequestException {
  constructor() {
    super(`${MEMBER_EXCEPTION_MSG.EmailAlreadyTaken}`);
  }
}
