import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CacheOptions } from './interfaces';

export const {
  ConfigurableModuleClass: CacheModuleClass,
  MODULE_OPTIONS_TOKEN: CACHE_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<CacheOptions>()
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
