import { SetMetadata } from '@nestjs/common';
import { Role, RoleMetaDataKey } from '@src/infrastructure/types/member';

export const Roles = (...roles: Role[]) => SetMetadata(RoleMetaDataKey, roles);
