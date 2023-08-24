import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UnsupportedCheckType } from '@src/infrastructure/exceptions';

export enum CheckType {
  EMAIL = 'email',
  GID = 'gid',
}

const checkTypeToArr = Object.keys(CheckType).map((x) => {
  return CheckType[x];
});

@Injectable()
export class CheckTypeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!checkTypeToArr.includes(value)) {
      throw new UnsupportedCheckType();
    }
    return value;
  }
}
