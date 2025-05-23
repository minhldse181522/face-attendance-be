import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DROPDOWN_REPOSITORY } from '../dropdown.di-tokens';
import { PrismaDropDownRepository } from '../database/dropdown.repository.prisma';

export class FindDropdownQuery {
  readonly type: string;
  readonly branchCode?: string;
  readonly roleCode?: string;

  constructor(params: {
    type: string;
    branchCode?: string;
    roleCode?: string;
  }) {
    this.type = params.type;
    this.branchCode = params.branchCode;
    this.roleCode = params.roleCode;
  }
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
    const { type, branchCode, roleCode } = query;
    return this.service.getDropdownData(type, branchCode, roleCode);
  }
}
