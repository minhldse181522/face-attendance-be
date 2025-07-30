import { Command, CommandProps } from '@src/libs/ddd';

export class CreateUserContractCommand extends Command {
  readonly title?: string | null;
  readonly description?: string | null;
  readonly startTime?: Date | null;
  readonly endTime?: Date | null;
  readonly duration?: string | null;
  readonly contractPdf?: string | null;
  readonly status?: string | null;
  readonly userCode?: string | null;
  readonly userBranchCode?: string | null;
  readonly managedBy?: string | null;
  readonly positionCode?: string | null;
  readonly endDate?: Date | null;
  readonly branchCodes?: string[];
  readonly createdBy: string;

  constructor(props: CommandProps<CreateUserContractCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
