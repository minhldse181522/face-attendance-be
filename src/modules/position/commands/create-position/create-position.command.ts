import { Command, CommandProps } from '@libs/ddd';

export class CreatePositionCommand extends Command {
  readonly code?: string | null;
  readonly positionName?: string | null;
  readonly role: string;
  readonly description?: string | null;
  readonly baseSalary?: number | null;
  readonly allowance?: number | null;
  readonly overtimeSalary?: number | null;
  readonly lateFine?: number | null;

  readonly createdBy: string;

  constructor(props: CommandProps<CreatePositionCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
