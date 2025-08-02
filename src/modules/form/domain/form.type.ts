export interface FormProps {
  id?: bigint;
  title: string;
  description?: string | null;
  roleCode: string;
  status: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}
export interface CreateFormProps {
  title: string;
  description?: string | null;
  roleCode: string;
  status: string;
  createdBy: string;
}

export interface UpdateFormProps {
  title?: string | null;
  description?: string | null;
  roleCode?: string | null;
  status?: string | null;
  updatedBy: string | null;
}
