import { Command, CommandProps } from '@libs/ddd';

export class DeleteObjectCommand extends Command {
  readonly path: string;

  constructor(props: CommandProps<DeleteObjectCommand>) {
    super(props);
    this.path = props.path;
  }
}
