import { Command, CommandProps } from '@libs/ddd';

export class CreateRoleCommand extends Command {
  readonly roleCode: string;
  readonly roleName: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateRoleCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
