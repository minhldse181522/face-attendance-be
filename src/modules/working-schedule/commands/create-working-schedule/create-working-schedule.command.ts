import { Command, CommandProps } from '@src/libs/ddd';

export class CreateWorkingScheduleCommand extends Command {
  readonly code?: string | null;
  readonly userCode?: string | null;
  readonly userContractCode?: string | null;
  readonly date?: Date | null;
  readonly shiftCode?: string | null;
  readonly status?: string | null;
  readonly branchCode?: string | null;
  readonly createdBy: string;

  constructor(props: CommandProps<CreateWorkingScheduleCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
