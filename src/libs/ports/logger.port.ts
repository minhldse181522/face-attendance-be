export interface LoggerPort {
  log(message: string, ...meta: unknown[]): void;
  error(message: string, trace?: unknown, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  debug(message: string, ...meta: unknown[]): void;
}

// Token used for Dependency Injection
export const LOGGER_PORT = Symbol('LOGGER_PORT');
