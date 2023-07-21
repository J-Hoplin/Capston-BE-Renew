import { BadRequestException } from '@nestjs/common';

export const CLASS_EXCEPTION_MSG = {
  ClassNotFound: 'CLASS_NOT_FOUND',
};

export class ClassNotFound extends BadRequestException {
  constructor() {
    super(CLASS_EXCEPTION_MSG.ClassNotFound);
  }
}
