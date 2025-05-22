import { Command, CommandProps } from '@libs/ddd';

export class RegisterCommand extends Command {
  readonly userName: string;
  readonly password: string;
  readonly roleCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly faceImg?: string | null;
  readonly email: string;
  readonly bod: Date;
  readonly address: string;
  readonly phone: string;
  readonly contract?: string | null;
  readonly branchCode: string;
  readonly positionCode: string;
  readonly managedBy: string;
  readonly createdBy: string;

  constructor(props: CommandProps<RegisterCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
