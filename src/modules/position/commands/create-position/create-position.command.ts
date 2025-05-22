import { Command, CommandProps } from '@libs/ddd';
import { Prisma } from '@prisma/client';

export class CreatePositionCommand extends Command {
  readonly code: string;
  readonly positionName: string;
  readonly basicSalary: Prisma.Decimal;
  readonly allowance: Prisma.Decimal;
  readonly overtimeSalary?: Prisma.Decimal;
  readonly lateFee?: Prisma.Decimal;

  readonly createdBy: string;

  constructor(props: CommandProps<CreatePositionCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
