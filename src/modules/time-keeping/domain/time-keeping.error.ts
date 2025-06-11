import { ExceptionBase } from '@src/libs/exceptions';

export class TimeKeepingNotFoundError extends ExceptionBase {
  static readonly message = 'Working Schedule not found';

  public readonly code = 'TIME_KEEPING.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(TimeKeepingNotFoundError.message, cause, metadata);
  }
}

export class TimeKeepingAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Working Schedule already exists';

  public readonly code = 'TIME_KEEPING.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(TimeKeepingAlreadyExistsError.message, cause, metadata);
  }
}

export class TimeKeepingAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Working Schedule already in use';

  public readonly code = 'TIME_KEEPING.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(TimeKeepingAlreadyInUseError.message, cause, metadata);
  }
}
