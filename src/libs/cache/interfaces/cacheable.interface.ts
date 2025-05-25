import { CacheService } from '../cache.service';

// Interface to include cacheService in the context
export interface Cacheable {
  cacheService: CacheService;
}
