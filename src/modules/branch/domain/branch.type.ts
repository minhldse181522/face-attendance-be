export interface BranchProps {
  id?: bigint;
  // Add properties here
  code: string;
  branchName: string;
  addressLine: string;
  placeId: string;
  city: string;
  district: string;
  lat: number;
  long: number;
  companyCode: string;

  // userBranches: UserBranch[];

  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}
export interface CreateBranchProps {
  // Add properties here
  code: string;
  branchName: string;
  addressLine: string;
  placeId: string;
  city: string;
  district: string;
  lat: number;
  long: number;
  companyCode: string;

  createdBy: string;
}

export interface UpdateBranchProps {
  // Add properties here
  code?: string | null;
  branchName?: string | null;
  addressLine?: string | null;
  placeId?: string | null;
  city?: string | null;
  district?: string | null;
  lat?: number | null;
  long?: number | null;
  companyCode?: string | null;

  updatedBy: string | null;
}
