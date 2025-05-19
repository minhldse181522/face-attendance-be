import { Module } from '@nestjs/common';
import { PrismaClientManager } from './prisma-client-manager';
import { PrismaMultiTenantModuleClass } from './prisma-multi-tenant.module-definition';

export interface ContextPayload {
  tenantId: string;
}

@Module({
  providers: [PrismaClientManager],
  exports: [PrismaClientManager],
})
export class PrismaMultiTenantModule extends PrismaMultiTenantModuleClass {}
