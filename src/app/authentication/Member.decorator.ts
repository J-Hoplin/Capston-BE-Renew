import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MemberEntity } from '@src/domain/member/member.entity';
import { use } from 'passport';

export const Member = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request?.user;
    return user;
  },
);
