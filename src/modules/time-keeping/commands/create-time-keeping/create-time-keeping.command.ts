import { Command, CommandProps } from '@src/libs/ddd';

export class CreateTimeKeepingCommand extends Command {
  readonly code?: string | null;
  readonly checkInTime?: Date | null;
  readonly checkOutTime?: Date | null;
  readonly workingHourReal?: string | null;
  readonly date?: Date | null;
  readonly status?: string | null;
  readonly userCode?: string | null;
  readonly workingScheduleCode?: string | null;
  readonly createdBy: string;

  constructor(props: CommandProps<CreateTimeKeepingCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
