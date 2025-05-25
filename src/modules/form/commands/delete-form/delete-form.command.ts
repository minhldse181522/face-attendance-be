export class DeleteFormCommand {
  readonly formId: bigint;

  constructor(props: DeleteFormCommand) {
    this.formId = props.formId;
  }
}
