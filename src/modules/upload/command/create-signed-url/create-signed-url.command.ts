import { Command, CommandProps } from '@libs/ddd';

interface CreateSignedUrlCommandProps {
  soTn: string;
  files: Express.Multer.File[];
}

export class CreateSignedUrlCommand extends Command {
  readonly fileUpload: CreateSignedUrlCommandProps[];
  readonly createdBy?: string;

  constructor(props: CommandProps<CreateSignedUrlCommand>) {
    super(props);

    this.fileUpload = props.fileUpload.map((file) => ({
      soTn: file.soTn,
      files: file.files,
    }));
  }
}
