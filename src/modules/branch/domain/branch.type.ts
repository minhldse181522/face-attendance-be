export interface BranchProps {
  id?: bigint;
  // Add properties here
  code: string;
  branchName: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}

export interface CreateBranchProps {
  // Add properties here
  code: string;
  branchName: string;
  createdBy: string;
}

export interface UpdateBranchProps {
  // Add properties here
  code?: string | null;
  branchName?: string | null;
  updatedBy: string | null;
}
