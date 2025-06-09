import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PrismaClientManager } from '@libs/prisma/prisma-client-manager';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LichLamViecRepositoryPort } from './lich-lam-viec.repository.port';

@Injectable()
export class LichLamViecRepository implements LichLamViecRepositoryPort {
  protected clients = new Map<string, PrismaClient>();

  constructor(protected readonly clientManager: PrismaClientManager) {}

  /*============================================================================================*/
  protected async _getClient(): Promise<PrismaClient> {
    const tenantId = RequestContextService.getTenantId() ?? '';

    let client = this.clients.get(tenantId);
    if (!client) {
      client = this.clientManager.getClient(tenantId);
      this.clients.set(tenantId, client);
    }

    return client;
  }
}
