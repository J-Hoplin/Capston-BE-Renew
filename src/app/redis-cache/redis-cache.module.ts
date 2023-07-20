import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { redisConfig } from '@src/options/redis.option';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [CacheModule.registerAsync<RedisClientOptions>(redisConfig)],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
