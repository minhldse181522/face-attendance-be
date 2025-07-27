import { Command, CommandProps } from '@src/libs/ddd';

export class ThanhToanLuongCommand extends Command {
  readonly payrollId: bigint;
  readonly status: string;

  readonly updatedBy: string;

  constructor(prosp: CommandProps<ThanhToanLuongCommand>) {
    super(prosp);
    Object.assign(this, prosp);
  }
}
