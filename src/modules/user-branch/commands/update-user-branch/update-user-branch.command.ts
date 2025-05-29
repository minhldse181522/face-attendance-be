import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateUserBranchCommand extends Command {
  readonly userBranchId: bigint;
  readonly branchCode?: string | null;
  readonly userContractCode?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateUserBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
