import { Decimal } from '@prisma/client/runtime/library';
import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateShiftCommand extends Command {
  readonly shiftId: bigint;
  readonly code?: string | null;
  readonly name?: string | null;
  readonly startTime?: Date | null;
  readonly endTime?: Date | null;
  readonly status?: string | null;
  readonly lunchBreak?: string | null;
  readonly workingHours?: Decimal | null;
  readonly delayTime?: Date | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateShiftCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
