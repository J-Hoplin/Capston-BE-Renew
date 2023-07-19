import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtTypes } from '@infrastructure/types';
import { Repository } from 'typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtSubjectType } from '@src/infrastructure/types/jwt';
import {
  AccessTokenRequired,
  MemberNotFound,
} from '@src/infrastructure/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
      ignoreExpiration: false,
      secretOrKey: 'jwtConf.secret,',
    });
  }

  async validate(payload: jwtTypes.JwtDecodedPayload) {
    if (payload.sub !== JwtSubjectType.ACCESS) {
      throw new AccessTokenRequired();
    }
    const user = await this.memberRepository.findOneBy({ id: payload.user_id });
    if (!user) {
      throw new MemberNotFound();
    }
    return user;
  }
}
