import { BadRequestException } from '@nestjs/common';

export const MEMBER_EXCEPTION_MSG = {
  MemberNotFound: 'Member not found',
  GroupIDAlreadyTaken: 'Groud ID already taken',
};

export class MemberNotFound extends BadRequestException {
  constructor(msg?: string) {
    super(msg ? msg : MEMBER_EXCEPTION_MSG.MemberNotFound);
  }
}

export class GroupIDAlreadyTaken extends BadRequestException {
  constructor(gid: string) {
    super(`${MEMBER_EXCEPTION_MSG.GroupIDAlreadyTaken} : ${gid}`);
  }
}
