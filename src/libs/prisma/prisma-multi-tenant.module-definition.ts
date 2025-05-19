import { ConfigurableModuleBuilder } from '@nestjs/common';
import { PrismaMultiTenantOptions } from './interface';

export const {
  ConfigurableModuleClass: PrismaMultiTenantModuleClass,
  OPTIONS_TYPE: PRISMA_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: PRISMA_ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN: PRISMA_MULTI_TENANT_OPTIONS,
} = new ConfigurableModuleBuilder<PrismaMultiTenantOptions>()
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
