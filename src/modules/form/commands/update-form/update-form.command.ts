import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateFormCommand extends Command {
  readonly formId: bigint;
  // Form properties
  readonly title?: string | null;
  readonly description?: string | null;
  readonly roleCode?: string | null;
  readonly status?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateFormCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
