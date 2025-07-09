import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PrismaClientManager } from '@libs/prisma/prisma-client-manager';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BangLuongRepositoryPort } from './bang-luong.repository.port';

@Injectable()
export class BangLuongRepository implements BangLuongRepositoryPort {
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
