export interface FormProps {
  id?: bigint;
  title: string;
  description?: string | null;
  roleCode: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}
export interface CreateFormProps {
  title: string;
  description?: string | null;
  roleCode: string;
  createdBy: string;
}

export interface UpdateFormProps {
  title?: string | null;
  description?: string | null;
  roleCode?: string | null;
  updatedBy: string | null;
}
