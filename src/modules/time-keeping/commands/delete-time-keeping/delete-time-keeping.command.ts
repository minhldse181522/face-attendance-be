export class DeleteTimeKeepingCommand {
  readonly timeKeepingId: bigint;

  constructor(props: DeleteTimeKeepingCommand) {
    this.timeKeepingId = props.timeKeepingId;
  }
}
