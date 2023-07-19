import { registerAs } from '@nestjs/config';
import { JwtSubjectType } from '@src/infrastructure/types/jwt';

export default registerAs('JWT_CONFIG', () => {
  return {
    accessToken: {
      expire: process.env.ACCESS_TOKEN_EXPIRE,
      subject: JwtSubjectType.ACCESS,
    },
    refreshToken: {
      expire: process.env.REFRESH_TOKEN_EXPIRE,
      subject: JwtSubjectType.REFRESH,
    },
    emailConfirm: {
      expire: process.env.EMAIL_CONFIRM_EXPIRE,
      subject: process.env.EMAIL_CONFIRM_SUBJECT,
    },
    secret: process.env.TOKEN_SECRET,
  };
});
