export class DeleteWorkingScheduleCommand {
  readonly workingScheduleId: bigint;

  constructor(props: DeleteWorkingScheduleCommand) {
    this.workingScheduleId = props.workingScheduleId;
  }
}
