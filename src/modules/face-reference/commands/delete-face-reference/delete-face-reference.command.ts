export class DeleteFaceReferenceCommand {
  readonly faceReferenceId: bigint;

  constructor(props: DeleteFaceReferenceCommand) {
    this.faceReferenceId = props.faceReferenceId;
  }
}
