export class DeleteUserCommand {
  readonly userId: bigint;

  constructor(props: DeleteUserCommand) {
    this.userId = props.userId;
  }
}
