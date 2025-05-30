export class DeleteUserContractCommand {
  readonly userContractId: bigint;

  constructor(props: DeleteUserContractCommand) {
    this.userContractId = props.userContractId;
  }
}
