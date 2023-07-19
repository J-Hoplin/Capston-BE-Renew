import { registerAs } from '@nestjs/config';

export default registerAs('EMAIL_INFO', () => {
  return {
    id: process.env.MAIL_ID,
    pw: process.env.MAIL_PASSWORD,
    gateway: process.env.MAIL_API_GATEWAY,
  };
});
