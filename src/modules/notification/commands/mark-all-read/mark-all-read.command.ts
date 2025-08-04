import { Command, CommandProps } from '@libs/ddd';

export class MarkAllReadCommand extends Command {
  readonly userCode: string;
  readonly updatedBy: string;

  constructor(props: CommandProps<MarkAllReadCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
