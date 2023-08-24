import { BadRequestException } from '@nestjs/common';

export const MEMBER_EXCEPTION_MSG = {
  MemberNotFound: 'MEMBER_NOT_FOUND',
  GroupIDAlreadyTaken: 'GROUP_ID_ALREADY_TAKEN',
  EmailAlreadyTaken: 'EMAIL_ALREADY_TAKEN',
  DepartmentIdNotGiven: 'DEPARTMENT_ID_NOT_GIVEN',
  UnsupportedCheckType: `UNSUPPORTED_CHECK_TYPE`,
};

export class UnsupportedCheckType extends BadRequestException {
  constructor() {
    super(MEMBER_EXCEPTION_MSG.UnsupportedCheckType);
  }
}

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

export class DepartmentIdNotGiven extends BadRequestException {
  constructor() {
    super(MEMBER_EXCEPTION_MSG.DepartmentIdNotGiven);
  }
}
