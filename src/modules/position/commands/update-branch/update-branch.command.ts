import { Command, CommandProps } from '@libs/ddd';
import { Prisma } from '@prisma/client';

export class UpdatePositionCommand extends Command {
  readonly positionId: bigint;
  // Add more properties here
  readonly code?: string | null;
  readonly roleCode?: string | null;
  readonly positionName?: string | null;
  readonly basicSalary?: Prisma.Decimal | null;
  readonly allowance?: Prisma.Decimal | null;
  readonly overtimeSalary?: Prisma.Decimal | null;
  readonly lateFee?: Prisma.Decimal | null;

  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdatePositionCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
