import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateWorkingScheduleCommand extends Command {
  readonly workingScheduleId: bigint;
  readonly code?: string | null;
  readonly userCode?: string | null;
  readonly userContractCode?: string | null;
  readonly date?: Date | null;
  readonly shiftCode?: string | null;
  readonly status?: string | null;
  readonly note?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateWorkingScheduleCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
