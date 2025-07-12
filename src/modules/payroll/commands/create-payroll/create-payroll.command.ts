import { Command, CommandProps } from '@libs/ddd';

export class CreatePayrollCommand extends Command {
  readonly userCode: string;
  readonly month: string;
  readonly baseSalary: number;
  readonly deductionFee?: number | null;
  readonly workDay: number;
  readonly allowance: number;
  readonly overtimeSalary: number;
  readonly lateFine: number;
  readonly lateTimeCount?: number | null;
  readonly otherFee?: number | null;
  readonly totalSalary: number;

  readonly createdBy: string;

  constructor(props: CommandProps<CreatePayrollCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
