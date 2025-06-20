import { PositionEntity } from '@src/modules/position/domain/position.entity';

export interface RoleProps {
  id?: bigint;
  // Add properties here
  roleCode: string;
  roleName: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  positions?: PositionEntity[];
}
export interface CreateRoleProps {
  // Add properties here
  roleCode: string;
  roleName: string;
  createdBy: string;
}

export interface UpdateRoleProps {
  // Add properties here
  roleCode?: string | null;
  roleName?: string | null;
  updatedBy: string | null;
}
