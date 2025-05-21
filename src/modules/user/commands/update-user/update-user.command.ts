import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateUserCommand extends Command {
  readonly userId: bigint;
  // Add more properties here
  readonly userName?: string | null;
  readonly roleCode?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly faceImg?: string | null;
  readonly email?: string | null;
  readonly bod?: Date | null;
  readonly address?: string | null;
  readonly phone?: string | null;
  readonly contract?: string | null;
  readonly branchCode?: string | null;
  readonly managedBy?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateUserCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
