export class DeleteShiftCommand {
  readonly shiftId: bigint;

  constructor(props: DeleteShiftCommand) {
    this.shiftId = props.shiftId;
  }
}
