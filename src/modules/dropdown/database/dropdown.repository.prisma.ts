import { Inject, Injectable } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '@src/modules/branch/branch.di-tokens';
import { BranchRepositoryPort } from '@src/modules/branch/database/branch.repository.port';
import { PositionRepositoryPort } from '@src/modules/position/database/position.repository.port';
import { POSITION_REPOSITORY } from '@src/modules/position/position.di-tokens';
import { RoleRepositoryPort } from '@src/modules/role/database/role.repository.port';
import { ROLE_REPOSITORY } from '@src/modules/role/role.di-tokens';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { USER_REPOSITORY } from '@src/modules/user/user.di-tokens';

export enum DropDownTypeEnum {
  USER = 'USER',
  ROLE = 'ROLE',
  POSITION = 'POSITION',
  BRANCH = 'BRANCH',
}

@Injectable()
export class PrismaDropDownRepository {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: RoleRepositoryPort,
    @Inject(POSITION_REPOSITORY)
    private readonly positionRepo: PositionRepositoryPort,
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepositoryPort,
  ) {}

  async getDropdownData(
    type: string,
    branchCode?: string[],
    roleCode?: string,
  ): Promise<any[]> {
    switch (type) {
      case DropDownTypeEnum.USER:
        return this.userRepo.findUserDropDown(branchCode, roleCode);
      case DropDownTypeEnum.ROLE:
        return this.roleRepo.findRoleDropDown();
      case DropDownTypeEnum.POSITION:
        return this.positionRepo.findPositionDropDown(roleCode);
      case DropDownTypeEnum.BRANCH:
        return this.branchRepo.findBranchDropDown();
      default:
        return [];
    }
  }
}
