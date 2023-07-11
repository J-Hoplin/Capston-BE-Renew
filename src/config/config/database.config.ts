import { registerAs } from '@nestjs/config';

export default registerAs('DB', () => ({
  type: process.env.DATABASE_TYPE,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT) || 3306,
  db: process.env.DATABASE_DEFAULT,
  auth: {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
}));
