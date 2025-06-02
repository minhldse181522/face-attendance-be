import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateUserContractCommand extends Command {
  readonly userContractId: bigint;
  readonly code?: string | null;
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
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateUserContractCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
