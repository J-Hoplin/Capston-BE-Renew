import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  public async get(key: string): Promise<string> {
    return await this.cache.get(key);
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    return await this.cache.set(key, value, ttl);
  }

  public async reset() {
    await this.cache.reset();
  }

  public async del(key: string) {
    await this.cache.del(key);
  }
}
