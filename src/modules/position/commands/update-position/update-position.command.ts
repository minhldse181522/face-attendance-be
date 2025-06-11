import { Command, CommandProps } from '@src/libs/ddd';

export class UpdatePositionCommand extends Command {
  readonly positionId: bigint;
  // Add more properties here
  readonly code?: string | null;
  readonly positionName?: string | null;
  readonly role?: string | null;
  readonly description?: string | null;
  readonly baseSalary?: number | null;
  readonly allowance?: number | null;
  readonly overtimeSalary?: number | null;
  readonly lateFine?: number | null;
  readonly updatedBy: string;

  constructor(props: CommandProps<UpdatePositionCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
