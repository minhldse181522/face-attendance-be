import { ExceptionBase } from '@libs/exceptions';

export class LoginError extends ExceptionBase {
  static readonly message = 'username or password is incorrect';

  public readonly code = 'USERNAME_PASSWORD_INCORRECT';

  constructor(cause?: Error, metadata?: unknown) {
    super(LoginError.message, cause, metadata);
  }
}

export class RegisterError extends ExceptionBase {
  static readonly message = 'Register not success';

  public readonly code = 'REGISTER_NOT_SUCCESS';

  constructor(cause?: Error, metadata?: unknown) {
    super(RegisterError.message, cause, metadata);
  }
}
