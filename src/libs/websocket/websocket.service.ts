import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WEBSOCKET_MODULE_OPTIONS } from './websocket.module-definition';
import { WebsocketModuleOptions } from './interfaces';
import Redis from 'ioredis';
import { ServerMessageDto } from './dtos';
import { WebsocketMessageTargetType } from './enums';

@Injectable()
export class WebsocketService implements OnModuleInit {
  private _pubClient: Redis; // use to send messages to clients by publishing to WebSocket server via Redis
  private _subClient: Redis; // use to receive messages from clients by subscribing to WebSocket server via Redis
  private _channelPrefix: string;

  constructor(
    @Inject(WEBSOCKET_MODULE_OPTIONS) private _options: WebsocketModuleOptions,
  ) {
    this._pubClient = new Redis({
      host: this._options.redis.host,
      port: this._options.redis.port,
      password: this._options.redis.password,
      family: this._options.redis.family || 4,
      tls: this._options.redis.tls,
      connectTimeout: this._options.redis.connectTimeout || 3000,
      retryStrategy:
        this._options.redis.retryStrategy ||
        ((times) => Math.min(times * 50, 2000)),
    });
    this._pubClient.on('connect', () => {
      console.log('PubClient connected');
    });
    this._pubClient.on('error', (error) => {
      console.error('PubClient error: ', error);
    });

    this._channelPrefix = this._options.channelPrefix;
  }

  async onModuleInit(): Promise<void> {
    this._subClient = this._pubClient.duplicate();
    this._subClient.on('connect', () => {
      console.log('SubClient connected');
    });
    this._subClient.on('error', (error) => {
      console.error('SubClient error: ', error);
    });
  }

  async publish(message: ServerMessageDto): Promise<void> {
    try {
      // Set default targetType if not provided
      if (!message.targetType) {
        message.targetType = WebsocketMessageTargetType.BROADCAST;
      }
      
      await this._pubClient.publish(
        `${this._channelPrefix}_serverMessage`,
        JSON.stringify(message),
      );
      console.log('Message published:', message);
    } catch (error) {
      console.error('Error publishing message: ', error);
    }
  }
}
