import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateTimeKeepingCommand extends Command {
  readonly timeKeepingId: bigint;
  readonly code?: string | null;
  readonly checkInTime?: Date | null;
  readonly checkOutTime?: Date | null;
  readonly workingHourReal?: string | null;
  readonly date?: Date | null;
  readonly status?: string | null;
  readonly userCode?: string | null;
  readonly workingScheduleCode?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateTimeKeepingCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
