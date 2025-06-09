import { ExceptionBase } from '@src/libs/exceptions';

export class ManagerNotAssignToUserError extends ExceptionBase {
  static readonly message =
    'This manager is not allowed to create working schedule for this user';

  public readonly code = 'MANAGER.NOT_ASSIGN_TO_USER';

  constructor(cause?: Error, metadata?: unknown) {
    super(ManagerNotAssignToUserError.message, cause, metadata);
  }
}

export class UserContractDoesNotExistError extends ExceptionBase {
  static readonly message = 'This user does not have user contract';

  public readonly code = 'USER_CONTRACT.DOES_NOT_EXIST';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractDoesNotExistError.message, cause, metadata);
  }
}

export class WorkingDateAlreadyExistError extends ExceptionBase {
  static readonly message = 'This date is already created for this user';

  public readonly code = 'WORKING_DATE.ALREADY_EXIST';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingDateAlreadyExistError.message, cause, metadata);
  }
}
