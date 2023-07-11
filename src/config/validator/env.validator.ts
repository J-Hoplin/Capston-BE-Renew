import * as Joi from 'joi';

export const envValidator = Joi.object({
  API_MODE: Joi.string().valid('production', 'development', 'test').required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.string().required(),
  DATABASE_DEFAULT: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE: Joi.string().required(),
  ACCESS_SUBJECT: Joi.string().required(),
  REFRESH_TOKEN_EXPIRE: Joi.string().required(),
  REFRESH_SUBJET: Joi.string().required(),
  TOKEN_SECRET: Joi.string().required(),
  ISSUER: Joi.string().required(),
  MONGO_HOST: Joi.string().required(),
  MONGO_PORT: Joi.string().required(),
  MONGO_USER: Joi.string().required(),
  MONGO_PASSWORD: Joi.string().required(),
  MAIL_ID: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_API_GATEWAY: Joi.string().required(),
}).unknown(); // allow unknow field except field in validator
