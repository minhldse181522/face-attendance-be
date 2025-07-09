import { ExceptionBase } from '@src/libs/exceptions';

export class PayrollNotFoundError extends ExceptionBase {
  static readonly message = 'Payroll not found';

  public readonly code = 'PAYROLL.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(PayrollNotFoundError.message, cause, metadata);
  }
}

export class PayrollAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Payroll already exists';

  public readonly code = 'PAYROLL.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(PayrollAlreadyExistsError.message, cause, metadata);
  }
}

export class PayrollAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Payroll already in use';

  public readonly code = 'PAYROLL.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(PayrollAlreadyInUseError.message, cause, metadata);
  }
}
