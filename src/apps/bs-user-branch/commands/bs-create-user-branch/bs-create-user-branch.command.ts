import { Command, CommandProps } from '@libs/ddd';

export class BsCreateUserBranchCommand extends Command {
  readonly branchCode: string;
  readonly userContractCode?: string | null;
  readonly createdBy: string;

  constructor(props: CommandProps<BsCreateUserBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
