import { ShiftEntity } from '@src/modules/shift/domain/shift.entity';
import { TimeKeepingEntity } from '@src/modules/time-keeping/domain/time-keeping.entity';
import { UserContractEntity } from '@src/modules/user-contract/domain/user-contract.entity';
import { UserEntity } from '@src/modules/user/domain/user.entity';

export interface WorkingScheduleProps {
  id?: bigint;
  code?: string | null;
  userCode?: string | null;
  userContractCode?: string | null;
  date?: Date | null;
  shiftCode?: string | null;
  status?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  user?: UserEntity;
  userContract?: UserContractEntity;
  shift?: ShiftEntity;
  timeKeeping?: TimeKeepingEntity;
}

export interface CreateWorkingScheduleProps {
  code?: string | null;
  userCode?: string | null;
  userContractCode?: string | null;
  date?: Date | null;
  shiftCode?: string | null;
  status?: string | null;
  createdBy: string;
}

export interface UpdateWorkingScheduleProps {
  code?: string | null;
  userCode?: string | null;
  userContractCode?: string | null;
  date?: Date | null;
  shiftCode?: string | null;
  status?: string | null;
  updatedBy: string | null;
}
