import { Command, CommandProps } from '@libs/ddd';

export class RegisterCommand extends Command {
  readonly userName: string;
  readonly password: string;
  readonly roleCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly bod: Date;
  readonly address: string;
  readonly phone: string;
  readonly createdBy: string;

  constructor(props: CommandProps<RegisterCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
