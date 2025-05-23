export interface RoleProps {
  id?: bigint;
  // Add properties here
  roleCode: string;
  roleName: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}
