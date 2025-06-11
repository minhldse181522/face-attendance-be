import { ConfigurableModuleBuilder } from '@nestjs/common';
import { MinioOptions } from './interfaces';

export const {
  ConfigurableModuleClass: MinioModuleClass,
  MODULE_OPTIONS_TOKEN: MINIO_OPTIONS,
} = new ConfigurableModuleBuilder<MinioOptions>()
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
