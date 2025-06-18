import { Command, CommandProps } from '@libs/ddd';

export class CreateFaceReferenceCommand extends Command {
  readonly faceImg: string;
  readonly userCode: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateFaceReferenceCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
