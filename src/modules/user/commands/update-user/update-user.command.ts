import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateUserCommand extends Command {
  readonly userId: bigint;
  // Add more properties here
  readonly userName?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email?: string | null;
  readonly faceImg?: string | null;
  readonly dob?: Date | null;
  readonly gender?: string | null;
  readonly phone?: string | null;
  readonly typeOfWork?: string | null;
  readonly isActive?: boolean | null;
  readonly roleCode?: string | null;
  readonly addressCode?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateUserCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
