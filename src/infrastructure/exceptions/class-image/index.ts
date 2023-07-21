import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const CLASS_IMAGE_EXCEPTION_MSG = {
  ImageNotFound: 'IMAGE_NOT_FOUND',
  ImageYetPending: 'IMAGE_YET_PENDING',
  ImageBuildFailed: 'IMAGE_BUILD_FAILED',
};

export class ImageNotFound extends BadRequestException {
  constructor() {
    super(CLASS_IMAGE_EXCEPTION_MSG.ImageNotFound);
  }
}

export class ImageYetPending extends UnprocessableEntityException {
  constructor() {
    super(CLASS_IMAGE_EXCEPTION_MSG.ImageYetPending);
  }
}

export class ImageBuildFailed extends UnprocessableEntityException {
  constructor() {
    super(CLASS_IMAGE_EXCEPTION_MSG.ImageBuildFailed);
  }
}
