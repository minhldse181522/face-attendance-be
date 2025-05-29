export interface UserBranchProps {
  id?: bigint;
  code: string;
  branchCode: string;
  userContractCode?: string | null;
  createdAt?: Date | null;
  createdBy: string;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export interface CreateUserBranchProps {
  code: string;
  branchCode: string;
  userContractCode: string | null;

  createdBy: string;
}

export interface UpdateUserBranchProps {
  branchCode?: string | null;
  userContractCode?: string | null;

  updatedBy: string | null;
}
