import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateBranchCommand extends Command {
  readonly branchId: bigint;
  // Add more properties here
  readonly code?: string | null;
  readonly branchName?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
