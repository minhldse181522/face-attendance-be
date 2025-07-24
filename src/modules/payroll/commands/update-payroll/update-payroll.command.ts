import { Command, CommandProps } from '@src/libs/ddd';

export class UpdatePayrollCommand extends Command {
  readonly payrollId: bigint;
  // Add more properties here
  readonly userCode?: string | null;
  readonly month?: string | null;
  readonly baseSalary?: number | null;
  readonly actualSalary?: number | null;
  readonly totalWorkHour?: number | null;
  readonly status?: string | null;
  readonly paidDate?: Date | null;
  readonly deductionFee?: number | null;
  readonly workDay?: number | null;
  readonly allowance?: number | null;
  readonly overtimeSalary?: number | null;
  readonly salaryOvertime?: number | null;
  readonly lateFine?: number | null;
  readonly lateTimeCount?: number | null;
  readonly otherFee?: number | null;
  readonly totalSalary?: number | null;

  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdatePayrollCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
