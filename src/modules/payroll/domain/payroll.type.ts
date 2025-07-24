import { UserEntity } from '@src/modules/user/domain/user.entity';

export interface PayrollProps {
  id?: bigint;
  // properties
  code: string;
  userCode: string;
  month: string;
  baseSalary: number;
  actualSalary?: number | null;
  totalWorkHour?: number | null;
  status?: string | null;
  paidDate?: Date | null;
  deductionFee?: number | null;
  workDay: number;
  allowance: number;
  overtimeSalary: number;
  salaryOvertime?: number | null;
  lateFine: number;
  lateTimeCount?: number | null;
  otherFee?: number | null;
  totalSalary: number;

  user?: UserEntity;

  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}

export interface CreatePayrollProps {
  code: string;
  userCode: string;
  month: string;
  baseSalary: number;
  actualSalary?: number | null;
  totalWorkHour?: number | null;
  status?: string | null;
  paidDate?: Date | null;
  deductionFee?: number | null;
  workDay: number;
  allowance: number;
  overtimeSalary: number;
  salaryOvertime?: number | null;
  lateFine: number;
  lateTimeCount?: number | null;
  otherFee?: number | null;
  totalSalary: number;

  createdBy: string;
}

export interface UpdatePayrollProps {
  code?: string | null;
  userCode?: string | null;
  month?: string | null;
  baseSalary?: number | null;
  actualSalary?: number | null;
  totalWorkHour?: number | null;
  status?: string | null;
  paidDate?: Date | null;
  deductionFee?: number | null;
  workDay?: number | null;
  allowance?: number | null;
  overtimeSalary?: number | null;
  salaryOvertime?: number | null;
  lateFine?: number | null;
  lateTimeCount?: number | null;
  otherFee?: number | null;
  totalSalary?: number | null;

  updatedBy: string | null;
}
