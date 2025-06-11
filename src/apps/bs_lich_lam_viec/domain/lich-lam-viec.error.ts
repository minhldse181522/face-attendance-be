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

export class ChamCongKhongDuDieuKienError extends ExceptionBase {
  static readonly message = 'Condition is not enough';

  public readonly code = 'CHAM_CONG.KHONG_DU_DIEU_KIEN';

  constructor(cause?: Error, metadata?: unknown) {
    super(ChamCongKhongDuDieuKienError.message, cause, metadata);
  }
}

export class CheckInTimeNotInContractError extends ExceptionBase {
  static readonly message = 'Check in time is not in the period of contract';

  public readonly code = 'CHECKIN_TIME.NOT_IN_CONTRACT';

  constructor(cause?: Error, metadata?: unknown) {
    super(CheckInTimeNotInContractError.message, cause, metadata);
  }
}

export class BranchNotBelongToContractError extends ExceptionBase {
  static readonly message = 'Chi nhánh không thuộc về chi nhánh trong hợp đồng';

  public readonly code = 'BRANCH.NOT_BELONG_TO_CONTRACT';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchNotBelongToContractError.message, cause, metadata);
  }
}
