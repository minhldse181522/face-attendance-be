import { ExceptionBase } from '@src/libs/exceptions';

export class UserContractNotFoundError extends ExceptionBase {
  static readonly message = 'User contract not found';

  public readonly code = 'USER_CONTRACT.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractNotFoundError.message, cause, metadata);
  }
}

export class UserContractAlreadyExistsError extends ExceptionBase {
  static readonly message = 'User contract already exists';

  public readonly code = 'USER_CONTRACT.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractAlreadyExistsError.message, cause, metadata);
  }
}

export class UserContractAlreadyInUseError extends ExceptionBase {
  static readonly message = 'User contract already in use';

  public readonly code = 'USER_CONTRACT.ALREADY_IN_USE';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractAlreadyInUseError.message, cause, metadata);
  }
}
export class BranchNotFoundError extends ExceptionBase {
  static readonly message = 'Branch not found';

  public readonly code = 'BRANCH.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchNotFoundError.message, cause, metadata);
  }
}
