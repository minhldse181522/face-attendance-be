export interface UserProps {
  id?: bigint;
  // Add properties here
  userName: string;
  password: string;
  roleCode: string;
  firstName: string;
  lastName: string;
  faceImg?: string | null;
  email: string;
  bod: Date;
  address: string;
  phone: string;
  contract?: string | null;
  branchCode: string;
  positionCode: string;
  managedBy: string;
  isActive?: boolean | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}

export interface RegisterUserProps {
  // Add properties here
  userName: string;
  password: string;
  roleCode: string;
  firstName: string;
  lastName: string;
  faceImg?: string | null;
  email: string;
  bod: Date;
  address: string;
  phone: string;
  contract?: string | null;
  branchCode: string;
  positionCode: string;
  managedBy: string;
  createdBy: string;
}

export interface UpdateUserProps {
  // Add properties here
  userName?: string | null;
  roleCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  faceImg?: string | null;
  email?: string | null;
  bod?: Date | null;
  address?: string | null;
  phone?: string | null;
  contract?: string | null;
  branchCode?: string | null;
  positionCode?: string | null;
  managedBy?: string | null;
  isActive?: boolean | null;
  updatedBy: string | null;
}
