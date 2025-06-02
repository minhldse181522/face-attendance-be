import { RoleEntity } from '@src/modules/role/domain/role.entity';

export enum RoleEnum {
  ADMIN = 'R1',
  HR = 'R2',
  MANAGER = 'R3',
  STAFF = 'R4',
}

export interface UserProps {
  id?: bigint;
  // Add properties here
  code: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  faceImg?: string | null;
  gender: string;
  dob: Date;
  phone: string;
  typeOfWork?: string | null;
  isActive: boolean;
  roleCode: string;
  addressCode?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  role?: RoleEntity;
  branchName?: string;
  managedBy?: string | null;
  positionCode?: string | null;
}

export interface RegisterUserProps {
  // Add properties here
  code: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  faceImg?: string | null;
  gender: string;
  dob: Date;
  phone: string;
  typeOfWork?: string | null;
  isActive: boolean;
  roleCode: string;
  addressCode?: string | null;
  createdBy: string;
}

export interface UpdateUserProps {
  // Add properties here
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  faceImg?: string | null;
  gender?: string | null;
  dob?: Date | null;
  phone?: string | null;
  typeOfWork?: string | null;
  isActive?: boolean | null;
  roleCode?: string | null;
  addressCode?: string | null;
  updatedBy: string | null;
}
