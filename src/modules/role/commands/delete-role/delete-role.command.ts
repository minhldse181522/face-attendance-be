export class DeleteRoleCommand {
  readonly roleId: bigint;

  constructor(props: DeleteRoleCommand) {
    this.roleId = props.roleId;
  }
}
