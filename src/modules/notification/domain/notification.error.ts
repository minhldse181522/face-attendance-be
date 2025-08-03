import { ExceptionBase } from '@src/libs/exceptions';

export class NotificationNotFoundError extends ExceptionBase {
  static readonly message = 'Notification not found';

  public readonly code = 'NOTIFICATION.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotificationNotFoundError.message, cause, metadata);
  }
}

export class NotificationAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Notification already exists';

  public readonly code = 'NOTIFICATION.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotificationAlreadyExistsError.message, cause, metadata);
  }
}

export class NotificationAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Notification already in use';

  public readonly code = 'NOTIFICATION.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotificationAlreadyInUseError.message, cause, metadata);
  }
}
