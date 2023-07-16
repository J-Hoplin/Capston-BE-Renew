import { BadRequestException } from '@nestjs/common';

export const DEPARTMENT_EXCEPTION_MSG = {
  DepartmentNotFound: 'Department not found',
  DepartmentNameAlreadyTaken: 'Department name already taken',
};

export class DepartmentNotFound extends BadRequestException {
  constructor(msg?: string) {
    super(msg ? msg : DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound);
  }
}

export class DepartmentNameAlreadyTaken extends BadRequestException {
  constructor(departmentName: string) {
    super(
      `${DEPARTMENT_EXCEPTION_MSG.DepartmentNameAlreadyTaken} : ${departmentName}`,
    );
  }
}
