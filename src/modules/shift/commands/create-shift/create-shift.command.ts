import { Command, CommandProps } from '@src/libs/ddd';

export class CreateShiftCommand extends Command {
  readonly code?: string | null;
  readonly name?: string | null;
  readonly startTime?: Date | null;
  readonly endTime?: Date | null;
  readonly status?: string | null;
  readonly lunchBreak?: string | null;
  readonly createdBy: string;

  constructor(props: CommandProps<CreateShiftCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
