export interface UserContractProps {
  id?: bigint;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
  branchNames?: string; // Add branch information field
}

export interface CreateUserContractProps {
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  createdBy: string;
}

export interface UpdateUserContractProps {
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  updatedBy: string | null;
}
