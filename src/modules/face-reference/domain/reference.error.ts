import { ExceptionBase } from '@src/libs/exceptions';

export class FaceReferenceNotFoundError extends ExceptionBase {
  static readonly message = 'FaceReference not found';

  public readonly code = 'FACE_REFERENCE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(FaceReferenceNotFoundError.message, cause, metadata);
  }
}

export class FaceReferenceAlreadyExistsError extends ExceptionBase {
  static readonly message = 'FaceReference already exists';

  public readonly code = 'FACE_REFERENCE.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(FaceReferenceAlreadyExistsError.message, cause, metadata);
  }
}

export class FaceReferenceAlreadyInUseError extends ExceptionBase {
  static readonly message = 'FaceReference already in use';

  public readonly code = 'FACE_REFERENCE.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(FaceReferenceAlreadyInUseError.message, cause, metadata);
  }
}
