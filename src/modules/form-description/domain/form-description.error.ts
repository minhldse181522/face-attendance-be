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
