import { Command, CommandProps } from '@libs/ddd';

export class LogoutCommand extends Command {
  readonly userName: string;

  constructor(props: CommandProps<LogoutCommand>) {
    super(props);
    this.userName = props.userName;
  }
}
