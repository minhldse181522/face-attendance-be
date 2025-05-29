export class DeleteUserBranchCommand {
  readonly userBranchId: bigint;

  constructor(props: DeleteUserBranchCommand) {
    this.userBranchId = props.userBranchId;
  }
}
