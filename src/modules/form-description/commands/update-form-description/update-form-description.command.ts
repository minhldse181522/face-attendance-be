import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateFormDescriptionCommand extends Command {
  readonly formDescriptionId: bigint;
  readonly reason?: string | null;
  readonly response?: string | null;
  readonly status?: string | null;
  readonly approvedTime?: Date | null;
  readonly startTime?: Date | null;
  readonly endTime?: Date | null;
  readonly approvedBy?: string | null;
  readonly statusOvertime?: boolean | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateFormDescriptionCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
