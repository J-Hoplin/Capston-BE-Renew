import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Member = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request?.user;
    return user;
  },
);
