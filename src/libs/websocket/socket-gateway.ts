import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { WebsocketService } from './websocket.service';
import { WEBSOCKET_MODULE_OPTIONS } from './websocket.module-definition';
import { WebsocketModuleOptions } from './interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly websocketService: WebsocketService,
    @Inject(WEBSOCKET_MODULE_OPTIONS)
    private readonly options: WebsocketModuleOptions,
  ) {}

  async afterInit(server: Server): Promise<void> {
    const redisSub: Redis = new Redis({
      host: this.options.redis.host,
      port: this.options.redis.port,
      password: this.options.redis.password,
      family: this.options.redis.family || 4,
      tls: this.options.redis.tls,
      connectTimeout: this.options.redis.connectTimeout || 3000,
    });

    const channel = `${this.options.channelPrefix}_serverMessage`;
    await redisSub.subscribe(channel);

    this.logger.log(`Subscribed to Redis channel: ${channel}`);

    redisSub.on('message', (chan, msg) => {
      this.logger.debug(`Received message from ${chan}: ${msg}`);
      const parsed = JSON.parse(msg);
      const { event, data } = parsed;

      server.emit(event, data);
      this.logger.log(`Socket emitted: ${event}`);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
