import { RoleEntity } from '@src/modules/role/domain/role.entity';

export interface PositionProps {
  id?: bigint;
  // Add properties here
  code?: string | null;
  positionName?: string | null;
  role: string;
  description?: string | null;
  baseSalary?: number | null;
  allowance?: number | null;
  overtimeSalary?: number | null;
  lateFine?: number | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  rolePosition?: RoleEntity;
}
export interface CreatePositionProps {
  // Add properties here
  code?: string | null;
  positionName?: string | null;
  role: string;
  description?: string | null;
  baseSalary?: number | null;
  allowance?: number | null;
  overtimeSalary?: number | null;
  lateFine?: number | null;
  createdBy: string;
}

export interface UpdatePositionProps {
  // Add properties here
  code?: string | null;
  positionName?: string | null;
  role?: string | null;
  description?: string | null;
  baseSalary?: number | null;
  allowance?: number | null;
  overtimeSalary?: number | null;
  lateFine?: number | null;
  updatedBy: string | null;
}
