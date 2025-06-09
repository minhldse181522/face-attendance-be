import { ExceptionBase } from '@src/libs/exceptions';

export class ShiftNotFoundError extends ExceptionBase {
  static readonly message = 'Working Schedule not found';

  public readonly code = 'SHIFT.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(ShiftNotFoundError.message, cause, metadata);
  }
}

export class ShiftAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Working Schedule already exists';

  public readonly code = 'SHIFT.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(ShiftAlreadyExistsError.message, cause, metadata);
  }
}

export class ShiftAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Working Schedule already in use';

  public readonly code = 'SHIFT.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(ShiftAlreadyInUseError.message, cause, metadata);
  }
}
