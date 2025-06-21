import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';

export interface TimeKeepingProps {
  id?: bigint;
  code?: string | null;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  workingHourReal?: string | null;
  date?: Date | null;
  status?: string | null;
  userCode?: string | null;
  workingScheduleCode?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  workingSchedules?: WorkingScheduleEntity[];
}

export interface CreateTimeKeepingProps {
  code?: string | null;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  workingHourReal?: string | null;
  date?: Date | null;
  status?: string | null;
  userCode?: string | null;
  workingScheduleCode?: string | null;
  createdBy: string;
}

export interface UpdateTimeKeepingProps {
  code?: string | null;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  workingHourReal?: string | null;
  date?: Date | null;
  status?: string | null;
  userCode?: string | null;
  workingScheduleCode?: string | null;
  updatedBy: string | null;
}
