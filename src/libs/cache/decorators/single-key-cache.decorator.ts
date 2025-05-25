import { Inject } from '@nestjs/common';
import { coalesceAsync } from 'promise-coalesce';
import { CacheMethodDecorator } from '../cache-method-decorator';
import { CacheService } from '../cache.service';
import { Cacheable } from '../interfaces/cacheable.interface';

export function SingleKeyCache(key: string): CacheMethodDecorator {
  const injectCacheService = Inject(CacheService);

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    injectCacheService(target, 'cacheService');

    const originalMethod = descriptor.value;
    descriptor.value = async function (this: Cacheable, ...args: any[]) {
      const cacheService = this.cacheService;

      const cacheKey = `${key}:${args[0]}`;
      const cacheData = await cacheService.get(cacheKey);

      if (cacheData) return JSON.parse(cacheData);

      // use coalesceAsync to prevent cache stampede effect
      return await coalesceAsync(cacheKey, async () => {
        const sourceValue = await originalMethod.apply(this, args);
        await cacheService.set(cacheKey, JSON.stringify(sourceValue));

        return sourceValue;
      });
    };
  };
}
