import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { Paginated } from '@src/libs/ddd';
import { PrismaPaginatedQueryBase } from '@src/libs/ddd/prisma-query.base';
import { Ok, Result } from 'oxide.ts';
import { FaceReferenceRepositoryPort } from '../../database/reference.repository.port';
import { FaceReferenceEntity } from '../../domain/reference.entity';
import { FACE_REFERENCE_REPOSITORY } from '../../face-reference.di-tokens';

export class FindFaceReferenceQuery extends PrismaPaginatedQueryBase<Prisma.FaceReferenceWhereInput> {}

export type FindFaceReferenceQueryResult = Result<
  Paginated<FaceReferenceEntity>,
  void
>;

@QueryHandler(FindFaceReferenceQuery)
export class FindFaceReferenceQueryHandler {
  constructor(
    @Inject(FACE_REFERENCE_REPOSITORY)
    protected readonly faceReferenceRepo: FaceReferenceRepositoryPort,
  ) {}

  async execute(
    query: FindFaceReferenceQuery,
  ): Promise<FindFaceReferenceQueryResult> {
    const result = await this.faceReferenceRepo.findAllPaginated(query);

    return Ok(
      new Paginated({
        data: result.data,
        count: result.count,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}
