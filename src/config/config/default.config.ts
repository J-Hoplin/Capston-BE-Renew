import { registerAs } from '@nestjs/config';

export default registerAs('DEFAULT_CONFIG', () => {
  return {
    hashCount: process.env.BCRYPT_HASH,
    gateWay: process.env.MAIL_API_GATEWAY,
  };
});
