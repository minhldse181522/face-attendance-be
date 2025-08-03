import { Command, CommandProps } from '@src/libs/ddd';

export class UpdateNotificationCommand extends Command {
  readonly notificationId: bigint;
  // Add more properties here
  readonly title?: string | null;
  readonly message?: string | null;
  readonly type?: string | null;
  readonly isRead?: boolean | null;

  readonly updatedBy: string | null;

  constructor(props: CommandProps<UpdateNotificationCommand>) {
    super(props);
    Object.assign(this, props);
  }
}
