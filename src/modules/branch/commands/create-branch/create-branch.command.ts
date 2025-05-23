import { Command, CommandProps } from '@libs/ddd';

export class CreateBranchCommand extends Command {
  readonly code: string;
  readonly branchName: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
