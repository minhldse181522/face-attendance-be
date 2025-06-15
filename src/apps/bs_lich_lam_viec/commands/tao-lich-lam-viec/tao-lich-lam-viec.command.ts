import { Command, CommandProps } from '@libs/ddd';

export class CreateLichLamViecCommand extends Command {
  readonly optionCreate: 'NGAY' | 'TUAN' | 'THANG';
  readonly holidayMode?: string[];
  readonly userCode: string;
  readonly date: Date;
  readonly shiftCode: string;
  readonly branchCode: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateLichLamViecCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
