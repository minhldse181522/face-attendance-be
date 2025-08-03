export class DeleteNotificationCommand {
  readonly notificationId: bigint;

  constructor(props: DeleteNotificationCommand) {
    this.notificationId = props.notificationId;
  }
}
