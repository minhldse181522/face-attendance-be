import { Command, CommandProps } from '@libs/ddd';

export class CreateNotificationCommand extends Command {
  readonly title: string;
  readonly message: string;
  readonly type: string;
  readonly isRead: boolean;
  readonly userCode?: string;

  readonly createdBy: string;

  constructor(props: CommandProps<CreateNotificationCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
