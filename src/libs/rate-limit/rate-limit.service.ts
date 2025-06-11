import { Inject, Injectable } from '@nestjs/common';
import { RateLimitOptions } from './interfaces';
import { RATE_LIMIT_OPTIONS } from './rate-limit.module-definition';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  private readonly _storeClient: Redis;
  private readonly _keyPrefix = 'RATE_LIMIT';
  private readonly _windowMs: number;
  private readonly _defaultLimit: number;

  constructor(@Inject(RATE_LIMIT_OPTIONS) private _options: RateLimitOptions) {
    this._windowMs = this._options.interval;
    this._defaultLimit = this._options.defaultLimit;

    this._storeClient = new Redis(this._options.store);
    this._storeClient.on('connect', () => {
      console.log('[RateLimit] Redis connected');
    });
    this._storeClient.on('error', (error) => {
      console.error('[RateLimit] Redis error: ', error);
    });
  }

  /**
   * Check if the request is within the rate limit
   */
  async check(
    key: string,
    limit: number = this._defaultLimit,
  ): Promise<boolean> {
    try {
      // get current time
      const now = Date.now();

      // use Lua script to atomically check and increment the counter
      const script = `
        -- Remove elements older than window
        redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])

        -- Get the number of elements in the set
        local count = redis.call('ZCARD', KEYS[1])

        -- Check if the limit has been reached
        if tonumber(count) >= tonumber(ARGV[2]) then
          return 0 -- limit reached
        end

        -- Add the current timestamp to the set
        redis.call('ZADD', KEYS[1], ARGV[3], ARGV[3])

        -- Set an expiry on the key
        redis.call('EXPIRE', KEYS[1], ARGV[4])

        return 1
      `;

      const result = await this._storeClient.eval(
        script,
        1,
        this._getKey(key), // KEYS[1]: key
        now - this._windowMs, // ARGV[1]: oldest timestamp to remove
        limit, // ARGV[2]: limit value
        now, // ARGV[3]: current timestamp
        Math.ceil(this._windowMs / 1000), // ARGV[4]: expiry time in seconds
      );

      return result === 1;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  private _getKey(key: string): string {
    return `${this._keyPrefix}:${key}`;
  }
}
