import { ExceptionBase } from '@src/libs/exceptions';

export class BranchNotFoundError extends ExceptionBase {
  static readonly message = 'Branch not found';

  public readonly code = 'BRANCH.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchNotFoundError.message, cause, metadata);
  }
}

export class BranchAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Branch already exists';

  public readonly code = 'BRANCH.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchAlreadyExistsError.message, cause, metadata);
  }
}

export class BranchAlreadyInUseError extends ExceptionBase {
  static readonly message = 'Branch already in use';

  public readonly code = 'BRANCH.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchAlreadyInUseError.message, cause, metadata);
  }
}
