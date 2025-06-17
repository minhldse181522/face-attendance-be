import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';

export interface ShiftProps {
  id?: bigint;
  code?: string | null;
  name?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  lunchBreak?: Date | null;
  workingHours?: number | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  workingSchedules?: WorkingScheduleEntity[];
}

export interface CreateShiftProps {
  code?: string | null;
  name?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  lunchBreak?: Date | null;
  workingHours?: number | null;
  createdBy: string;
}

export interface UpdateShiftProps {
  code?: string | null;
  name?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  lunchBreak?: Date | null;
  workingHours?: number | null;
  updatedBy: string | null;
}
