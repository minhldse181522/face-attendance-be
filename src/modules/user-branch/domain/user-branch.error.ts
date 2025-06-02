import { ExceptionBase } from '@src/libs/exceptions';

export class UserBranchNotFoundError extends ExceptionBase {
  static readonly message = 'User Branch not found';

  public readonly code = 'USER_BRANCH.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserBranchNotFoundError.message, cause, metadata);
  }
}

export class UserBranchAlreadyExistsError extends ExceptionBase {
  static readonly message = 'User Branch already exists';

  public readonly code = 'USER_BRANCH.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserBranchAlreadyExistsError.message, cause, metadata);
  }
}

export class UserBranchAlreadyInUseError extends ExceptionBase {
  static readonly message = 'User Branch already in use';

  public readonly code = 'USER_BRANCH.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserBranchAlreadyInUseError.message, cause, metadata);
  }
}
