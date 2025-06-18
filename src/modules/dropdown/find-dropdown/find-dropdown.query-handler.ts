import { PrismaDropDownRepository } from './../database/dropdown.repository.prisma';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DROPDOWN_REPOSITORY } from '../dropdown.di-tokens';

export class FindDropdownQuery {
  readonly type: string;
  readonly branchCode?: string[];
  readonly roleCode?: string;
  readonly userCode?: string;

  constructor(params: {
    type: string;
    branchCode?: string[];
    roleCode?: string;
    userCode?: string;
  }) {
    this.type = params.type;
    this.branchCode = params.branchCode;
    this.roleCode = params.roleCode;
    this.userCode = params.userCode;
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
    const { type, branchCode, roleCode, userCode } = query;
    return this.service.getDropdownData(type, branchCode, roleCode, userCode);
  }
}
