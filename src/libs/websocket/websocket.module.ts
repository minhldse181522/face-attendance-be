import { Module } from '@nestjs/common';
import { WebsocketModuleClass } from './websocket.module-definition';
import { WebsocketService } from './websocket.service';

@Module({
  providers: [WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule extends WebsocketModuleClass {}
