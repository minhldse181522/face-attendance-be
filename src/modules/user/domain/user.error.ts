import { ExceptionBase } from '@src/libs/exceptions';

export class UserNotFoundError extends ExceptionBase {
  static readonly message = 'User not found';

  public readonly code = 'USER.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserNotFoundError.message, cause, metadata);
  }
}

export class UserAlreadyExistsError extends ExceptionBase {
  static readonly message = 'User already exists';

  public readonly code = 'USER.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserAlreadyExistsError.message, cause, metadata);
  }
}

export class UserWithScheduleExistsError extends ExceptionBase {
  static readonly message = 'Không thể cập nhật nhân viên đã có lịch làm việc';

  public readonly code = 'USER.WITH_SCHEDULE_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserWithScheduleExistsError.message, cause, metadata);
  }
}
