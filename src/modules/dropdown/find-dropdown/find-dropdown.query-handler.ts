import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DROPDOWN_REPOSITORY } from '../dropdown.di-tokens';
import { PrismaDropDownRepository } from '../database/dropdown.repository.prisma';

export class FindDropdownQuery {
  constructor(public readonly type: string) {}
}

@QueryHandler(FindDropdownQuery)
export class FindDropdownQueryHandler
  implements IQueryHandler<FindDropdownQuery>
{
  constructor(
    @Inject(DROPDOWN_REPOSITORY)
    private readonly service: PrismaDropDownRepository,
  ) {}

  async execute(query: FindDropdownQuery): Promise<any> {
    const { type } = query;
    return this.service.getDropdownData(type);
  }
}
