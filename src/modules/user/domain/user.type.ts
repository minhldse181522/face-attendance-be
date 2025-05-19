export interface UserProps {
  id?: bigint;
  // Add properties here
  userName: string;
  password: string;
  roleCode: string;
  firstName: string;
  lastName: string;
  email: string;
  bod: Date;
  address: string;
  phone: string;
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
  email: string;
  bod: Date;
  address: string;
  phone: string;
  createdBy: string;
}
