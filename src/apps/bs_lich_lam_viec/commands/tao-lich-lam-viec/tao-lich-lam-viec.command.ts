import { Command, CommandProps } from '@libs/ddd';

export class CreateLichLamViecCommand extends Command {
  readonly userCode: string;
  readonly date: Date;
  readonly shiftCode: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateLichLamViecCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
