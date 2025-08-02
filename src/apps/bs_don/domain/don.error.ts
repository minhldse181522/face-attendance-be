import { ExceptionBase } from '@src/libs/exceptions';

export class ManagerNotAssignToUserError extends ExceptionBase {
  static readonly message =
    'This manager is not allowed to create working schedule for this user';

  public readonly code = 'MANAGER.NOT_ASSIGN_TO_USER';

  constructor(cause?: Error, metadata?: unknown) {
    super(ManagerNotAssignToUserError.message, cause, metadata);
  }
}
