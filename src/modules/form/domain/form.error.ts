import { ExceptionBase } from '@src/libs/exceptions';

export class FormNotFoundError extends ExceptionBase {
  static readonly message = 'Form not found';

  public readonly code = 'FORM.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormNotFoundError.message, cause, metadata);
  }
}

export class FormAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Form already exists';

  public readonly code = 'FORM.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormAlreadyExistsError.message, cause, metadata);
  }
}

export class FormAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Form already in use';

  public readonly code = 'FORM.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(FormAlreadyInUseError.message, cause, metadata);
  }
}
