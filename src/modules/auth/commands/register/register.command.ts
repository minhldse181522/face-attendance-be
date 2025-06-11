import { Command, CommandProps } from '@libs/ddd';

export class RegisterCommand extends Command {
  readonly userName: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly faceImg?: string | null;
  readonly gender: string;
  readonly dob: Date;
  readonly phone: string;
  readonly typeOfWork?: string | null;
  readonly roleCode: string;
  readonly addressCode?: string | null;
  readonly createdBy: string;

  constructor(props: CommandProps<RegisterCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
