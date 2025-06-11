import Redis from 'ioredis';

export interface RateLimitOptions {
  interval: number; // milliseconds
  defaultLimit: number;
  store: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    tls?: { path?: string };
    family?: number;
    connectTimeout?: number;
    retryStrategy?(times: number): number;
  };
}
