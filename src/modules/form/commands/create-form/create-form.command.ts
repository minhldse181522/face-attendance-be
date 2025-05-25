import { Command, CommandProps } from '@libs/ddd';

export class CreateFormCommand extends Command {
  readonly title: string;
  readonly description?: string | null;
  readonly roleCode: string;
  readonly createdBy: string;

  constructor(props: CommandProps<CreateFormCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
