import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtTypes, member } from '@infrastructure/types';
import { Repository } from 'typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtSubjectType } from '@src/infrastructure/types/jwt';
import {
  AccessTokenRequired,
  InvalidMemberApproval,
  MemberNotFound,
} from '@src/infrastructure/exceptions';
import jwtConfig from '@src/config/config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConf.secret,
    });
  }

  async validate(payload: jwtTypes.JwtDecodedPayload) {
    if (payload.sub !== JwtSubjectType.ACCESS) {
      throw new AccessTokenRequired();
    }
    const user = await this.memberRepository.findOne({
      where: {
        id: payload.user_id,
      },
      relations: {
        instructorProfile: {
          department: true,
        },
        studentProfile: {
          department: true,
        },
      },
    });
    console.log(user);
    // If user not found
    if (!user) {
      throw new MemberNotFound();
    }

    // If member's approval status is improper
    if (user.approved !== member.Approve.APPROVE) {
      throw new InvalidMemberApproval();
    }
    return user;
  }
}
