import { BadRequestException } from '@nestjs/common';

export const CLASS_EXCEPTION_MSG = {
  ClassNotFound: 'CLASS_NOT_FOUND',
  CantUpdateToLowerBound: 'CANT_UPDATE_TO_LOWER_BOUND',
  StudentCountExceed: 'STUDENT_COUNT_EXCEED',
  DuplicatedClassNameFound: 'DUPLICATED_CLASS_NAME_FOUND',
  UnavailableToEnroll: 'UNAVAILABLE_TO_ENROLL',
};

export class ClassNotFound extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.ClassNotFound);
  }
}

export class CantUpdateToLowerBound extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.CantUpdateToLowerBound);
  }
}

export class StudentCountExceed extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.StudentCountExceed);
  }
}

export class DuplicatedClassNameFound extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.DuplicatedClassNameFound);
  }
}

export class UnavailableToEnroll extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.UnavailableToEnroll);
  }
}
