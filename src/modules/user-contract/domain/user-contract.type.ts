import { PositionEntity } from '@src/modules/position/domain/position.entity';
import { UserBranchEntity } from '@src/modules/user-branch/domain/user-branch.entity';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';

export interface UserContractProps {
  id?: bigint;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  endDate?: Date | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  user?: UserEntity;
  manager?: UserEntity;
  position?: PositionEntity;
  userBranches?: UserBranchEntity[];
  workingSchedule?: WorkingScheduleEntity[];
}

export interface CreateUserContractProps {
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  endDate?: Date | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  createdBy: string;
}

export interface UpdateUserContractProps {
  code?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: string | null;
  contractPdf?: string | null;
  status?: string | null;
  endDate?: Date | null;
  userCode?: string | null;
  managedBy?: string | null;
  positionCode?: string | null;
  updatedBy: string | null;
}
