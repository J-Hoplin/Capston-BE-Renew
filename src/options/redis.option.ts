import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const redisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    return {
      store: await redisStore({
        socket: {
          host: config.get('REDIS_HOST'),
          port: +config.get('REDIS_PORT'),
        },
      }),
    };
  },
  inject: [ConfigService],
};
