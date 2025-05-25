import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_MODULE_OPTIONS } from './cache.module-definition';
import { CacheOptions } from './interfaces';

@Injectable()
export class CacheService implements OnModuleInit {
  private _redis: Redis;

  constructor(@Inject(CACHE_MODULE_OPTIONS) private _options: CacheOptions) {
    this._redis = new Redis({
      host: this._options.host,
      port: this._options.port,
      password: this._options.password,
      family: this._options.family || 4,
      tls: this._options.tls,
      connectTimeout: this._options.connectTimeout || 3000,
      retryStrategy:
        this._options.retryStrategy || ((times) => Math.min(times * 50, 2000)),
    });

    this._redis.on('connect', () => {
      console.log('Redis connected');
    });
    this._redis.on('error', (error) => {
      console.error('Redis error: ', error);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this._redis.ping();
    } catch (error) {
      console.error('Unable to connect to Redis:', error);
      throw new Error('Unable to connect to Redis');
    }
  }

  public async ping(): Promise<string | null> {
    return this._redis.ping();
  }

  public async get(key: string): Promise<string | null> {
    return this._redis.get(key);
  }

  public async set(
    key: string,
    value: string,
    ttl = 1000 * 60 * 60 * 24 * 7, // TODO
  ): Promise<void> {
    await this._redis.set(key, value, 'PX', ttl);
  }

  public async hget(key: string, field: string): Promise<string | null> {
    return this._redis.hget(key, field);
  }

  public async hset(
    key: string,
    field: string,
    value: string,
  ): Promise<number> {
    return this._redis.hset(key, field, value);
  }

  public async hdel(key: string, fields: string[]): Promise<void> {
    fields.forEach(async (field) => {
      await this._redis.hdel(key, field);
    });
  }

  public async del(key: string): Promise<number> {
    return this._redis.del(key);
  }

  public async delMany(keys: string[]): Promise<void> {
    // avoid ERR CROSSSLOT with cluster mode
    keys.forEach(async (key) => {
      await this._redis.del(key);
    });
  }

  public async delPattern(pattern: string): Promise<void> {
    const keys = await this._redis.keys(pattern);
    if (keys && keys.length) {
      await Promise.all(
        keys.map(async (key) => {
          await this._redis.del(key);
        }),
      );
    }
  }

  public async delAll(): Promise<'OK'> {
    return this._redis.flushdb();
  }

  /** SET commands */
  public async sadd(key: string, value: string): Promise<number> {
    return this._redis.sadd(key, value);
  }

  public async scard(key: string): Promise<number> {
    return this._redis.scard(key);
  }

  public async smembers(key: string): Promise<string[]> {
    return this._redis.smembers(key);
  }

  public async srem(key: string, value: string): Promise<number> {
    return this._redis.srem(key, value);
  }

  public async incr(key: string): Promise<number> {
    return this._redis.incr(key);
  }

  public async expire(key: string, expireSeconds: number): Promise<number> {
    return this._redis.expire(key, expireSeconds);
  }
}
