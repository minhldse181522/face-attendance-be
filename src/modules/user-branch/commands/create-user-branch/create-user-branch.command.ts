import { Command, CommandProps } from '@libs/ddd';

export class CreateUserBranchCommand extends Command {
  readonly branchCode: string;
  readonly userContractCode: string;
  readonly createdBy: string;

  constructor(props: CommandProps<CreateUserBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
