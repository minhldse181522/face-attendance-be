import { Command, CommandProps } from '@src/libs/ddd';

export class ChamCongCommand extends Command {
  readonly workingScheduleId: bigint;
  readonly userCode: string;
  readonly checkInTime?: Date;

  readonly updatedBy: string;

  constructor(prosp: CommandProps<ChamCongCommand>) {
    super(prosp);
    Object.assign(this, prosp);
  }
}
