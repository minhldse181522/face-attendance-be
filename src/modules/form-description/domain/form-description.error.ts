import { ExceptionBase } from '@src/libs/exceptions';

export class FormDescriptionNotFoundError extends ExceptionBase {
  static readonly message = 'Form description not found';

  public readonly code = 'FORM_DESCRIPTION.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormDescriptionNotFoundError.message, cause, metadata);
  }
}

export class FormDescriptionAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Form description already exists';

  public readonly code = 'FORM_DESCRIPTION.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormDescriptionAlreadyExistsError.message, cause, metadata);
  }
}

export class FormDescriptionUpdateNotAllowedError extends ExceptionBase {
  static readonly message = 'Form description update not allowed';

  public readonly code = 'FORM_DESCRIPTION.UPDATE_NOT_ALLOWED';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormDescriptionUpdateNotAllowedError.message, cause, metadata);
  }
}

export class FormDescriptionInvalidStatusError extends ExceptionBase {
  static readonly message = 'Invalid form description status';

  public readonly code = 'FORM_DESCRIPTION.INVALID_STATUS';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormDescriptionInvalidStatusError.message, cause, metadata);
  }
}

export class FormNotFoundError extends ExceptionBase {
  static readonly message = 'Referenced form not found';

  public readonly code = 'FORM_DESCRIPTION.FORM_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormNotFoundError.message, cause, metadata);
  }
}

export class UserToUpdateFaceNotFoundError extends ExceptionBase {
  static readonly message = 'Không tìm thấy người dùng này để cập nhật';

  public readonly code = 'FORM_DESCRIPTION.USER_TO_UPDATE_FACE_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserToUpdateFaceNotFoundError.message, cause, metadata);
  }
}

export class UserContractToEndNotFoundError extends ExceptionBase {
  static readonly message =
    'Không tìm thấy hợp đồng người dùng này để cập nhật';

  public readonly code = 'FORM_DESCRIPTION.USER_CONTRACT_TO_END_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractToEndNotFoundError.message, cause, metadata);
  }
}

export class WorkingScheduleForOverTimeNotFoundError extends ExceptionBase {
  static readonly message =
    'Không tìm thấy lịch làm việc của nhân viên này cho tăng ca';

  public readonly code =
    'FORM_DESCRIPTION.WORKING_SCHEDULE_FOR_OVERTIME_NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingScheduleForOverTimeNotFoundError.message, cause, metadata);
  }
}

export class TimeKeepingAlreadyOverlap extends ExceptionBase {
  static readonly message =
    'Đơn này đã có lịch làm việc trùng với thời gian tăng ca';

  public readonly code = 'FORM_DESCRIPTION.TIME_KEEPING_ALREADY_OVERLAP';

  constructor(cause?: Error, metadata?: unknown) {
    super(TimeKeepingAlreadyOverlap.message, cause, metadata);
  }
}

export class InvalidFormStatusError extends ExceptionBase {
  static readonly message = 'Trạng thái đơn không hợp lệ';

  public readonly code = 'FORM_DESCRIPTION.IN_VALID_FORM_ERROR';

  constructor(cause?: Error, metadata?: unknown) {
    super(InvalidFormStatusError.message, cause, metadata);
  }
}
