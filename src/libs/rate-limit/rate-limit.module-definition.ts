import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RateLimitOptions } from './interfaces';

export const {
  ConfigurableModuleClass: RateLimitModuleClass,
  MODULE_OPTIONS_TOKEN: RATE_LIMIT_OPTIONS,
} = new ConfigurableModuleBuilder<RateLimitOptions>()
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
