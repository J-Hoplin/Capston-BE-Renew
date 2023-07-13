import { BadRequestException } from '@nestjs/common';

export const DEPARTMENT_EXCEPTION_MSG = {
  DepartmentNotFound: 'Department not found',
};

export class DepartmentNotFound extends BadRequestException {
  constructor(msg?: string) {
    super(msg ? msg : DEPARTMENT_EXCEPTION_MSG.DepartmentNotFound);
  }
}
