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

export class NotAllowToCheckout extends ExceptionBase {
  static readonly message = 'Không được checkout trước khi hết giờ làm việc';

  public readonly code = 'TIME_KEEPING.NOT_ALLOW_TO_CHECK_OUT';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotAllowToCheckout.message, cause, metadata);
  }
}

export class NotAllowToCheckoutAfterMidNight extends ExceptionBase {
  static readonly message = 'Không được checkout sau 12h đêm';

  public readonly code = 'TIME_KEEPING.NOT_ALLOW_TO_CHECK_OUT_AFTER_MID_NIGHT';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotAllowToCheckoutAfterMidNight.message, cause, metadata);
  }
}
