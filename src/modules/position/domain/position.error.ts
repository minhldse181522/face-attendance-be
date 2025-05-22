import { ExceptionBase } from '@src/libs/exceptions';

export class PositionNotFoundError extends ExceptionBase {
  static readonly message = 'Position not found';

  public readonly code = 'POSITION.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(PositionNotFoundError.message, cause, metadata);
  }
}

export class PositionAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Position already exists';

  public readonly code = 'POSITION.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(PositionAlreadyExistsError.message, cause, metadata);
  }
}

export class PositionAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Position already in use';

  public readonly code = 'POSITION.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(PositionAlreadyInUseError.message, cause, metadata);
  }
}
