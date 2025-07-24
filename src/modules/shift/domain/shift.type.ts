import { Decimal } from '@prisma/client/runtime/library';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';

export enum ShiftStatusEnum {
  ACTIVE = 'ACTIVE',
  NOTACTIVE = 'NOTACTIVE',
}

export interface ShiftProps {
  id?: bigint;
  code?: string | null;
  name?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status: string;
  lunchBreak?: string | null;
  workingHours?: Decimal | null;
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
  status: string;
  lunchBreak?: string | null;
  workingHours?: Decimal | null;
  createdBy: string;
}

export interface UpdateShiftProps {
  code?: string | null;
  name?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status?: string | null;
  lunchBreak?: string | null;
  workingHours?: Decimal | null;
  updatedBy: string | null;
}
