import { ConfigModuleOptions } from '@nestjs/config';
import { envValidator } from '@src/config/validator/env.validator';
import * as dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../config/env/${process.env.API_MODE || 'dev'}.env`,
});

export const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: [
    `${__dirname}/../config/env/${process.env.API_MODE || 'dev'}.env`,
  ],
  cache: true,
  load: [],
  validationSchema: envValidator,
  validationOptions: {
    abortEarly: true,
    allowUnknown: true,
  },
};
