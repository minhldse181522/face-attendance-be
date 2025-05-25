export interface CacheOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: { path?: string };
  family?: number;
  connectTimeout?: number;
  retryStrategy?(times: number): number;
}
