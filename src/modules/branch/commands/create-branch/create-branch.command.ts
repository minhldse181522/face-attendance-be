import { Command, CommandProps } from '@libs/ddd';

export class CreateBranchCommand extends Command {
  readonly branchName: string;
  readonly addressLine: string;
  readonly placeId: string;
  readonly city: string;
  readonly district: string;
  readonly lat: number;
  readonly long: number;
  readonly companyCode: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
