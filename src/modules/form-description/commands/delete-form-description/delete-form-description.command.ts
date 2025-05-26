export class DeleteFormDescriptionCommand {
  readonly formDescriptionId: bigint;

  constructor(props: DeleteFormDescriptionCommand) {
    this.formDescriptionId = props.formDescriptionId;
  }
}
