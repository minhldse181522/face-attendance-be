import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateFaceReferenceCommand extends Command {
  readonly faceReferenceId: bigint;
  readonly code?: string | null;
  readonly faceImg?: string | null;
  readonly userCode?: string | null;
  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateFaceReferenceCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
