import { Command, CommandProps } from '@libs/ddd';

export class DownloadCommand extends Command {
  readonly path: string;

  constructor(props: CommandProps<DownloadCommand>) {
    super(props);
    this.path = props.path;
  }
}
