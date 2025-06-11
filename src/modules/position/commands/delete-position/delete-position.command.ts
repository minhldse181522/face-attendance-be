export class DeletePositionCommand {
  readonly positionId: bigint;

  constructor(props: DeletePositionCommand) {
    this.positionId = props.positionId;
  }
}
