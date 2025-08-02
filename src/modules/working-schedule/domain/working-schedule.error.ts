import { ExceptionBase } from '@src/libs/exceptions';

export class WorkingScheduleNotFoundError extends ExceptionBase {
  static readonly message = 'Working Schedule not found';

  public readonly code = 'WORKING_SCHEDULE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingScheduleNotFoundError.message, cause, metadata);
  }
}

export class WorkingScheduleAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Working Schedule already exists';

  public readonly code = 'WORKING_SCHEDULE.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingScheduleAlreadyExistsError.message, cause, metadata);
  }
}

export class WorkingScheduleAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Working Schedule already in use';

  public readonly code = 'WORKING_SCHEDULE.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingScheduleAlreadyInUseError.message, cause, metadata);
  }
}

export class WorkingScheduleInvalidStatusForDeletionError extends ExceptionBase {
  static readonly message = 'Chỉ có thể xóa lịch làm việc chưa bắt đầu';

  public readonly code = 'WORKING_SCHEDULE.INVALID_STATUS_FOR_DELETION';

  constructor(cause?: Error, metadata?: unknown) {
    super(
      WorkingScheduleInvalidStatusForDeletionError.message,
      cause,
      metadata,
    );
  }
}
