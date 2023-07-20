import { BadRequestException } from '@nestjs/common';

export const DEPARTMENT_EXCEPTION_MSG = {
  DepartmentNotFound: 'DEPARTMENT_NOT_FOUND',
  DepartmentNameAlreadyTaken: 'DEPARTMENT_NAME_ALREADY_TAKE',
  MemberStillBelongsToDepartment: 'SOME_MEMBER_STILL_BELONGS_TO_DEPARTMENT',
};

export class DepartmentNotFound extends BadRequestException {
  constructor() {
    super(DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound);
  }
}

export class DepartmentNameAlreadyTaken extends BadRequestException {
  constructor() {
    super(`${DEPARTMENT_EXCEPTION_MSG.DepartmentNameAlreadyTaken}`);
  }
}

export class MemberStillBelongsToDepartment extends BadRequestException {
  constructor() {
    super(`${DEPARTMENT_EXCEPTION_MSG.MemberStillBelongsToDepartment}`);
  }
}
