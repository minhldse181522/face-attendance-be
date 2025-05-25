import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateRoleCommand extends Command {
  readonly roleId: bigint;
  // Add more properties here
  readonly roleCode?: string | null;
  readonly roleName?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateRoleCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
