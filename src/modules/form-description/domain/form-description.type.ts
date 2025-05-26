export interface FormDescriptionProps {
  id?: bigint;
  code: string;
  reason: string;
  status: string;
  file?: string | null;
  startTime: Date;
  endTime: Date;
  approvedTime?: Date | null;
  formId: bigint;
  submittedBy: string;
  approvedBy?: string | null;
  createdBy: string;
  updatedBy?: string | null;
}

export interface CreateFormDescriptionProps {
  code: string;
  reason: string;
  status: string;
  file?: string | null;
  startTime: Date;
  endTime: Date;
  formId: bigint;
  submittedBy: string;
  createdBy: string;
}

export interface UpdateFormDescriptionProps {
  status?: string | null;
  approvedTime?: Date | null;
  approvedBy?: string | null;
  updatedBy: string | null;
}

export enum FormDescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
