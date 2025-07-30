import { ConfigurableModuleBuilder } from '@nestjs/common';
import { WebsocketModuleOptions } from './interfaces';

export const {
  ConfigurableModuleClass: WebsocketModuleClass,
  MODULE_OPTIONS_TOKEN: WEBSOCKET_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<WebsocketModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();
