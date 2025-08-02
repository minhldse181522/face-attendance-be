import { Command, CommandProps } from '@src/libs/ddd';

export class TaoDonCommand extends Command {
  readonly reason: string;
  readonly status?: string;
  readonly file?: string | null;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly statusOvertime?: boolean | null;
  readonly formId: string;
  readonly submittedBy: string;
  readonly createdBy: string;

  constructor(props: CommandProps<TaoDonCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
