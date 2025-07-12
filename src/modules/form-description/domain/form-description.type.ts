export interface FormDescriptionProps {
  id?: bigint;
  code: string;
  reason: string;
  response?: string | null;
  status: string;
  file?: string | null;
  startTime: Date;
  endTime: Date;
  approvedTime?: Date | null;
  statusOvertime?: boolean | null;
  formId: bigint;
  formTitle?: string; // Add formTitle property
  submittedBy: string;
  approvedBy?: string | null;
  createdBy: string;
  updatedBy?: string | null;
}

export interface CreateFormDescriptionProps {
  code: string;
  reason: string;
  response?: string | null;
  status: string;
  file?: string | null;
  startTime: Date;
  endTime: Date;
  statusOvertime?: boolean | null;
  formId: bigint;
  submittedBy: string;
  createdBy: string;
}

export interface UpdateFormDescriptionProps {
  status?: string | null;
  response?: string | null;
  approvedTime?: Date | null;
  statusOvertime?: boolean | null;
  approvedBy?: string | null;
  updatedBy: string | null;
}

export enum FormDescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCEL = 'CANCEL',
}
