export class DeleteShiftCommand {
  readonly shiftId: bigint;
  readonly status: string;

  constructor(props: DeleteShiftCommand) {
    this.shiftId = props.shiftId;
    this.status = props.status;
  }
}
