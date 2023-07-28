import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberEntity } from '@src/domain/member/member.entity';
import { member } from '@src/infrastructure/types';
import { JwtPayload } from '@src/infrastructure/types/jwt';
import { Role, RoleMetaDataKey } from '@src/infrastructure/types/member';
import { Observable } from 'rxjs';

@Injectable()
export class AllowedMember implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const availableRoles = this.reflector.get<Role>(
      RoleMetaDataKey,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user: MemberEntity = request?.user;
    if (!user) {
      return false;
    }
    const checkRole = availableRoles.includes(user.memberRole);
    const checkApprove = user.approved === member.Approve.APPROVE;
    const checkEmailConfirmed = user.emailConfirmed === true;
    return checkRole || checkApprove || checkEmailConfirmed;
  }
}
