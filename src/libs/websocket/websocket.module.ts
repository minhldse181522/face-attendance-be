import { Module } from '@nestjs/common';
import { WebsocketModuleClass } from './websocket.module-definition';
import { WebsocketService } from './websocket.service';
import { SocketGateway } from './socket-gateway';

@Module({
  providers: [WebsocketService, SocketGateway],
  exports: [WebsocketService],
})
export class WebsocketModule extends WebsocketModuleClass {}
