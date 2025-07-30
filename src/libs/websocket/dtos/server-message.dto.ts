import { WebsocketMessageTargetType } from '../enums';

export class ServerMessageDto {
  event: string; // event name client listens to
  data: any; // data to send to client
  target?: string | string[]; // target client(s) to send message to: client id(s), room id(s), etc.
  targetType?: WebsocketMessageTargetType =
    WebsocketMessageTargetType.BROADCAST;
}
