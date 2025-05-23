import { ExceptionBase } from '@src/libs/exceptions';

export class RoleNotFoundError extends ExceptionBase {
  static readonly message = 'Role not found';

  public readonly code = 'ROLE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(RoleNotFoundError.message, cause, metadata);
  }
}

export class RoleAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Role already exists';

  public readonly code = 'ROLE.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(RoleAlreadyExistsError.message, cause, metadata);
  }
}

export class RoleAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Role already in use';

  public readonly code = 'ROLE.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(RoleAlreadyInUseError.message, cause, metadata);
  }
}
