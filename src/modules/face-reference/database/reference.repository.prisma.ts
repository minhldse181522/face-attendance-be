import { PrismaMultiTenantRepositoryBase } from '@libs/db/prisma-multi-tenant-repository.base';
import { Injectable } from '@nestjs/common';
import { FaceReference as FaceReferenceModel } from '@prisma/client';
import { PrismaClientManager } from '@src/libs/prisma/prisma-client-manager';
import { FaceReferenceEntity } from '../domain/reference.entity';
import { FaceReferenceMapper } from '../mappers/reference.mapper';
import { FaceReferenceRepositoryPort } from './reference.repository.port';

@Injectable()
export class PrismaFaceReferenceRepository
  extends PrismaMultiTenantRepositoryBase<
    FaceReferenceEntity,
    FaceReferenceModel
  >
  implements FaceReferenceRepositoryPort
{
  protected modelName = 'faceReference';

  constructor(
    private manager: PrismaClientManager,
    mapper: FaceReferenceMapper,
  ) {
    super(manager, mapper);
  }
}
