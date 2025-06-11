import { Command, CommandProps } from '@libs/ddd';

export class DirectUploadCommand extends Command {
  readonly key: string;
  readonly file: Express.Multer.File;
  readonly userCode: string;

  constructor(props: CommandProps<DirectUploadCommand>) {
    super(props);
    this.key = props.key;
    this.file = props.file;
    this.userCode = props.userCode;
  }
}
