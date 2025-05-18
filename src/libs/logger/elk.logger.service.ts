import { createLogger, format, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { loggerConfig } from '@config/logger.config';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { LoggerPort } from '@libs/ports/logger.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ELKLoggerService implements LoggerPort {
  private logger: any;

  constructor() {
    const esClientOptions: ClientOptions = {
      node: loggerConfig.node,
    };

    const esTransport = new ElasticsearchTransport({
      client: new Client(esClientOptions),
      level: 'info',
      index: 'logs',
    });

    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.Console(), esTransport],
    });
  }

  log(message: string, ...meta: unknown[]): void {
    this.logger.info(message, ...meta);
  }

  error(message: string, trace?: unknown, ...meta: unknown[]): void {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, ...meta: unknown[]): void {
    this.logger.warn(message, ...meta);
  }

  debug(message: string, ...meta: unknown[]): void {
    this.logger.debug(message, ...meta);
  }
}
