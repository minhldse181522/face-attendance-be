export class DeleteBranchCommand {
  readonly branchId: bigint;

  constructor(props: DeleteBranchCommand) {
    this.branchId = props.branchId;
  }
}
