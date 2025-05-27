import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateBranchCommand extends Command {
  readonly branchId: bigint;
  // Add more properties here
  readonly branchName?: string | null;
  readonly addressLine?: string | null;
  readonly placeId?: string | null;
  readonly city?: string | null;
  readonly district?: string | null;
  readonly lat?: number | null;
  readonly long?: number | null;
  readonly companyCode?: string | null;

  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateBranchCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
