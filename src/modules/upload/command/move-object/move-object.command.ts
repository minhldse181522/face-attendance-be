import { Command, CommandProps } from '@libs/ddd';
import { infor } from './move-object.request.dto';

export class MoveObjectCommand extends Command {
  readonly information: infor[];
  readonly newSide: string;

  constructor(props: CommandProps<MoveObjectCommand>) {
    super(props);
    this.information = props.information;
    this.newSide = props.newSide;
  }
}
